def register_user(client, email, role='guest', password='secret123'):
    res = client.post('/api/auth/register', json={
        'name': email.split('@')[0].title(),
        'email': email,
        'password': password,
        'role': role,
    })
    assert res.status_code == 201, res.get_json()
    data = res.get_json()
    return data['user'], data['token']


def auth(token):
    return {'Authorization': f'Bearer {token}'}


def create_property(client, host_token, title='Test Property', price=100):
    res = client.post('/api/properties/', json={
        'title': title,
        'description': 'A nice place to stay.',
        'price_per_night': price,
        'location': 'Goa, India',
        'photos': ['https://example.com/photo1.jpg'],
        'amenities': ['WiFi'],
    }, headers=auth(host_token))
    assert res.status_code == 201, res.get_json()
    return res.get_json()


def create_contact_request(client, guest_token, property_id, message='Hi, interested!'):
    res = client.post('/api/contact-requests/', json={
        'property_id': property_id,
        'message': message,
    }, headers=auth(guest_token))
    assert res.status_code == 201, res.get_json()
    return res.get_json()


def respond_contact_request(client, host_token, cr_id, action='approved'):
    res = client.put(f'/api/contact-requests/{cr_id}/respond', json={'action': action},
                     headers=auth(host_token))
    assert res.status_code == 200, res.get_json()
    return res.get_json()


def send_message(client, token, cr_id, text):
    return client.post('/api/messages/', json={'contact_request_id': cr_id, 'text': text},
                       headers=auth(token))


def make_approved_contact(client):
    """Register host + guest, create property and an approved contact request."""
    guest, guest_token = register_user(client, 'guest@test.com', role='guest')
    host, host_token = register_user(client, 'host@test.com', role='host')
    prop = create_property(client, host_token, title='Test Property')
    cr = create_contact_request(client, guest_token, prop['id'])
    respond_contact_request(client, host_token, cr['id'], action='approved')
    return {
        'guest': guest,
        'guest_token': guest_token,
        'host': host,
        'host_token': host_token,
        'property': prop,
        'contact_request': cr,
    }
