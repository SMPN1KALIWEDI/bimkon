const API_URL = 'https://script.google.com/macros/s/AKfycbxMJaZ7GLeA9xH92YQCvan4JWvMxR3GxQ1bxXDQSxsEwCqaXU4LxZpMMedv8LTOAAhqeg/exec';

async function apiGet(action, params = {}) {
  params.action = action;
  const queryString = Object.keys(params).map(key => key + '=' + encodeURIComponent(params[key])).join('&');
  const response = await fetch(API_URL + '?' + queryString);
  return await response.json();
}

async function apiPost(action, data = {}) {
  await fetch(API_URL + '?action=' + action, {
    method: 'POST', mode: 'no-cors',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return { success: true, message: 'Data berhasil dikirim!' };
}

function showAlert(page, msg, type) {
  const el = document.getElementById('alert-' + page);
  if (!el) { alert(msg); return; }
  el.innerText = msg;
  el.className = 'alert alert-' + type;
  el.style.display = 'block';
  setTimeout(() => el.style.display = 'none', 4000);
}
