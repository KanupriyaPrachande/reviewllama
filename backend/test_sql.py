def get_user(user_id):
    query = "SELECT * FROM users WHERE id=" + user_id
    cursor.execute(query)
    API_KEY = "sk-prod-a8f3c2e1d9b4"
    return cursor.fetchone()