from tests.helpers import (
    register_user,
    create_property,
    create_contact_request,
    make_approved_contact,
    auth,
)


def test_send_requires_approved_contact(client):
    _, host_token = register_user(client, 'host@test.com', 'host')
    guest, guest_token = register_user(client, 'guest@test.com', 'guest')
    prop = create_property(client, host_token)
    cr = create_contact_request(client, guest_token, prop['id'])

    res = client.post('/api/messages/', json={'contact_request_id': cr['id'], 'text': 'hello'},
                      headers=auth(guest_token))
    assert res.status_code == 403


def test_send_not_participant_forbidden(client):
    _, host_token = register_user(client, 'host@test.com', 'host')
    guest, guest_token = register_user(client, 'guest@test.com', 'guest')
    stranger, stranger_token = register_user(client, 'stranger@test.com', 'guest')
    prop = create_property(client, host_token)
    cr = create_contact_request(client, guest_token, prop['id'])
    client.put(f'/api/contact-requests/{cr["id"]}/respond', json={'action': 'approved'},
               headers=auth(host_token))

    res = client.post('/api/messages/', json={'contact_request_id': cr['id'], 'text': 'hi'},
                      headers=auth(stranger_token))
    assert res.status_code == 403


def test_send_empty_text_rejected(client):
    ctx = make_approved_contact(client)
    res = client.post('/api/messages/',
                      json={'contact_request_id': ctx['contact_request']['id'], 'text': '   '},
                      headers=auth(ctx['guest_token']))
    assert res.status_code == 400


def test_send_creates_message_and_notification(client):
    ctx = make_approved_contact(client)
    cr_id = ctx['contact_request']['id']

    res = client.post('/api/messages/', json={'contact_request_id': cr_id, 'text': 'Is it available?'},
                      headers=auth(ctx['guest_token']))
    assert res.status_code == 201
    msg = res.get_json()
    assert msg['sender_id'] == ctx['guest']['id']
    assert msg['deleted'] is False
    assert msg['read_at'] is None

    res = client.get('/api/notifications/unread-count', headers=auth(ctx['host_token']))
    assert res.get_json()['count'] == 2

    res = client.get('/api/messages/conversations', headers=auth(ctx['host_token']))
    convos = res.get_json()
    assert len(convos) == 1
    assert convos[0]['unread'] == 1
    assert convos[0]['last_message'] == 'Is it available?'


def test_list_by_request_restricted(client):
    ctx = make_approved_contact(client)
    _, stranger_token = register_user(client, 'stranger@test.com', 'guest')
    cr_id = ctx['contact_request']['id']
    client.post('/api/messages/', json={'contact_request_id': cr_id, 'text': 'hello'},
                headers=auth(ctx['guest_token']))

    res = client.get(f'/api/messages/by-request/{cr_id}', headers=auth(ctx['guest_token']))
    assert res.status_code == 200
    assert len(res.get_json()) == 1

    res = client.get(f'/api/messages/by-request/{cr_id}', headers=auth(stranger_token))
    assert res.status_code == 403


def test_list_by_request_pagination(client):
    ctx = make_approved_contact(client)
    cr_id = ctx['contact_request']['id']
    for i in range(3):
        client.post('/api/messages/', json={'contact_request_id': cr_id, 'text': f'message {i}'},
                    headers=auth(ctx['guest_token']))

    res = client.get(f'/api/messages/by-request/{cr_id}?limit=2&offset=0', headers=auth(ctx['host_token']))
    assert len(res.get_json()) == 2
    res = client.get(f'/api/messages/by-request/{cr_id}?limit=2&offset=2', headers=auth(ctx['host_token']))
    assert len(res.get_json()) == 1


def test_mark_conversation_read(client):
    ctx = make_approved_contact(client)
    cr_id = ctx['contact_request']['id']
    client.post('/api/messages/', json={'contact_request_id': cr_id, 'text': 'hi 1'},
                headers=auth(ctx['guest_token']))
    client.post('/api/messages/', json={'contact_request_id': cr_id, 'text': 'hi 2'},
                headers=auth(ctx['guest_token']))

    res = client.put(f'/api/messages/by-request/{cr_id}/read', headers=auth(ctx['host_token']))
    assert res.status_code == 200
    body = res.get_json()
    assert body['updated'] == 2
    assert body['unread'] == 0

    res = client.get('/api/messages/conversations', headers=auth(ctx['host_token']))
    assert res.get_json()[0]['unread'] == 0

    msgs = client.get(f'/api/messages/by-request/{cr_id}', headers=auth(ctx['guest_token'])).get_json()
    assert all(m['read_at'] for m in msgs)

    res = client.put(f'/api/messages/by-request/{cr_id}/read', headers=auth(ctx['host_token']))
    assert res.get_json()['updated'] == 0


def test_delete_message_by_sender_only(client):
    ctx = make_approved_contact(client)
    cr_id = ctx['contact_request']['id']
    msg = client.post('/api/messages/', json={'contact_request_id': cr_id, 'text': 'secret'},
                      headers=auth(ctx['guest_token'])).get_json()

    res = client.delete(f"/api/messages/{msg['id']}", headers=auth(ctx['host_token']))
    assert res.status_code == 403

    res = client.delete(f"/api/messages/{msg['id']}", headers=auth(ctx['guest_token']))
    assert res.status_code == 200
    assert res.get_json()['deleted'] is True


def test_delete_missing_message(client):
    ctx = make_approved_contact(client)
    res = client.delete('/api/messages/99999', headers=auth(ctx['guest_token']))
    assert res.status_code == 404


def test_conversations_exclude_other_users(client):
    ctx = make_approved_contact(client)
    _, other_guest_token = register_user(client, 'other@test.com', 'guest')
    res = client.get('/api/messages/conversations', headers=auth(other_guest_token))
    assert res.get_json() == []
