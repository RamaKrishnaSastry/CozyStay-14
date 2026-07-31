from tests.helpers import (
    register_user,
    create_property,
    create_contact_request,
    make_approved_contact,
    auth,
)


def test_list_only_own_notifications(client):
    _, host_token = register_user(client, 'host@test.com', 'host')
    guest, guest_token = register_user(client, 'guest@test.com', 'guest')
    _, host2_token = register_user(client, 'host2@test.com', 'host')
    prop = create_property(client, host_token)
    create_contact_request(client, guest_token, prop['id'])

    res = client.get('/api/notifications/', headers=auth(host_token))
    notifs = res.get_json()
    assert len(notifs) == 1
    assert all(n['user_id'] == 1 for n in notifs)

    res = client.get('/api/notifications/', headers=auth(host2_token))
    assert res.get_json() == []


def test_unread_count(client):
    _, host_token = register_user(client, 'host@test.com', 'host')
    guest, guest_token = register_user(client, 'guest@test.com', 'guest')
    prop = create_property(client, host_token)
    create_contact_request(client, guest_token, prop['id'])

    res = client.get('/api/notifications/unread-count', headers=auth(host_token))
    assert res.get_json()['count'] == 1

    res = client.get('/api/notifications/unread-count', headers=auth(guest_token))
    assert res.get_json()['count'] == 0


def test_mark_read_single(client):
    ctx = make_approved_contact(client)
    client.post('/api/messages/', json={'contact_request_id': ctx['contact_request']['id'], 'text': 'hi'},
                headers=auth(ctx['guest_token']))

    notifs = client.get('/api/notifications/', headers=auth(ctx['host_token'])).get_json()
    nid = notifs[0]['id']

    res = client.put(f'/api/notifications/{nid}/read', headers=auth(ctx['host_token']))
    assert res.status_code == 200
    assert res.get_json()['read'] is True

    res = client.get('/api/notifications/unread-count', headers=auth(ctx['host_token']))
    assert res.get_json()['count'] == 1


def test_mark_read_others_notification_forbidden(client):
    ctx = make_approved_contact(client)
    client.post('/api/messages/', json={'contact_request_id': ctx['contact_request']['id'], 'text': 'hi'},
                headers=auth(ctx['guest_token']))
    notifs = client.get('/api/notifications/', headers=auth(ctx['host_token'])).get_json()
    nid = notifs[0]['id']

    res = client.put(f'/api/notifications/{nid}/read', headers=auth(ctx['guest_token']))
    assert res.status_code == 404


def test_mark_all_read(client):
    ctx = make_approved_contact(client)
    cr_id = ctx['contact_request']['id']
    client.post('/api/messages/', json={'contact_request_id': cr_id, 'text': 'hi'},
                headers=auth(ctx['guest_token']))
    client.post('/api/messages/', json={'contact_request_id': cr_id, 'text': 'again'},
                headers=auth(ctx['guest_token']))

    res = client.put('/api/notifications/read-all', headers=auth(ctx['host_token']))
    assert res.status_code == 200
    res = client.get('/api/notifications/unread-count', headers=auth(ctx['host_token']))
    assert res.get_json()['count'] == 0


def test_delete_notification(client):
    ctx = make_approved_contact(client)
    cr_id = ctx['contact_request']['id']
    client.post('/api/messages/', json={'contact_request_id': cr_id, 'text': 'hi'},
                headers=auth(ctx['guest_token']))
    notifs = client.get('/api/notifications/', headers=auth(ctx['host_token'])).get_json()

    for notif in notifs:
        res = client.delete(f"/api/notifications/{notif['id']}", headers=auth(ctx['host_token']))
        assert res.status_code == 200

    res = client.get('/api/notifications/', headers=auth(ctx['host_token']))
    assert res.get_json() == []


def test_delete_others_notification_forbidden(client):
    ctx = make_approved_contact(client)
    cr_id = ctx['contact_request']['id']
    client.post('/api/messages/', json={'contact_request_id': cr_id, 'text': 'hi'},
                headers=auth(ctx['guest_token']))
    notifs = client.get('/api/notifications/', headers=auth(ctx['host_token'])).get_json()
    nid = notifs[0]['id']

    res = client.delete(f'/api/notifications/{nid}', headers=auth(ctx['guest_token']))
    assert res.status_code == 404
