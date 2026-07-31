from tests.helpers import (
    register_user,
    create_property,
    create_contact_request,
    respond_contact_request,
    auth,
)


def test_create_contact_request(client):
    guest, guest_token = register_user(client, 'guest@test.com', 'guest')
    host, host_token = register_user(client, 'host@test.com', 'host')
    prop = create_property(client, host_token)

    cr = create_contact_request(client, guest_token, prop['id'], message='Hi!')

    assert cr['property_id'] == prop['id']
    assert cr['guest_id'] == guest['id']
    assert cr['host_id'] == host['id']
    assert cr['status'] == 'pending'

    res = client.get('/api/notifications/unread-count', headers=auth(host_token))
    assert res.status_code == 200
    assert res.get_json()['count'] == 1


def test_duplicate_pending_request_rejected(client):
    guest, guest_token = register_user(client, 'guest@test.com', 'guest')
    _, host_token = register_user(client, 'host@test.com', 'host')
    prop = create_property(client, host_token)

    create_contact_request(client, guest_token, prop['id'])
    res = client.post('/api/contact-requests/', json={'property_id': prop['id']},
                      headers=auth(guest_token))
    assert res.status_code == 409


def test_cannot_request_own_property(client):
    host, host_token = register_user(client, 'host@test.com', 'host')
    prop = create_property(client, host_token)
    res = client.post('/api/contact-requests/', json={'property_id': prop['id']},
                      headers=auth(host_token))
    assert res.status_code == 400


def test_respond_approves_and_notifies_guest(client):
    guest, guest_token = register_user(client, 'guest@test.com', 'guest')
    _, host_token = register_user(client, 'host@test.com', 'host')
    prop = create_property(client, host_token)
    cr = create_contact_request(client, guest_token, prop['id'])

    updated = respond_contact_request(client, host_token, cr['id'], action='approved')
    assert updated['status'] == 'approved'

    res = client.get('/api/notifications/unread-count', headers=auth(guest_token))
    assert res.get_json()['count'] == 1


def test_respond_requires_host(client):
    guest, guest_token = register_user(client, 'guest@test.com', 'guest')
    _, host_token = register_user(client, 'host@test.com', 'host')
    prop = create_property(client, host_token)
    cr = create_contact_request(client, guest_token, prop['id'])

    res = client.put(f'/api/contact-requests/{cr["id"]}/respond', json={'action': 'approved'},
                     headers=auth(guest_token))
    assert res.status_code == 403


def test_respond_invalid_action(client):
    _, host_token = register_user(client, 'host@test.com', 'host')
    guest, guest_token = register_user(client, 'guest@test.com', 'guest')
    prop = create_property(client, host_token)
    cr = create_contact_request(client, guest_token, prop['id'])

    res = client.put(f'/api/contact-requests/{cr["id"]}/respond', json={'action': 'maybe'},
                     headers=auth(host_token))
    assert res.status_code == 400


def test_delete_contact_request_by_participant(client):
    _, host_token = register_user(client, 'host@test.com', 'host')
    guest, guest_token = register_user(client, 'guest@test.com', 'guest')
    prop = create_property(client, host_token)
    cr = create_contact_request(client, guest_token, prop['id'])

    res = client.delete(f'/api/contact-requests/{cr["id"]}', headers=auth(guest_token))
    assert res.status_code == 200
    res = client.delete(f'/api/contact-requests/{cr["id"]}', headers=auth(guest_token))
    assert res.status_code == 404


def test_list_requests_filtered_by_role(client):
    _, host_token = register_user(client, 'host@test.com', 'host')
    guest, guest_token = register_user(client, 'guest@test.com', 'guest')
    prop = create_property(client, host_token)
    create_contact_request(client, guest_token, prop['id'])

    res = client.get('/api/contact-requests/?role=host', headers=auth(host_token))
    assert len(res.get_json()) == 1

    res = client.get('/api/contact-requests/?role=guest', headers=auth(guest_token))
    assert len(res.get_json()) == 1

    res = client.get('/api/contact-requests/?role=guest', headers=auth(host_token))
    assert len(res.get_json()) == 0
