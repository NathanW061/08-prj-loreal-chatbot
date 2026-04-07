/* DOM elements */
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");
const userSubmit = document.getElementById("sendBtn");

let messageHistory = [
  {
    role: 'system',
    content: 'You are a chatbot that answers questions about, and gives advice/recommendations related to, L\'Oréal brand products. If the user asks a question that would be relevant to one or more L\'Oréal product(s) or the products L\'Oréal carries in general, such as beauty-related topics, go ahead and answer them. Otherwise, politely decline to answer the question and offer suggestions on topics you can respond to. Also, please do not use double asterisks in your response.'
  }
];

// Set initial message
//chatWindow.textContent = "👋 Hello! How can I help you today?";

/* Handle form submit */
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  messageHistory.push({
    role: 'user',
    content: userInput.value
  });
  appendMessage(userInput.value, 'user');
  userInput.value = '';
  enableInput(false);

  const sysWaitingMsg = appendSystemMessage('Thinking...', true);
  // When using Cloudflare, you'll need to POST a `messages` array in the body,
  // and handle the response using: data.choices[0].message.content
  //chatWindow.textContent = "Waiting for a response...";
  let response = await fetch('https://loreal-chatbot-security.nathan-winkel.workers.dev/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      messages: messageHistory
    })
  });

  await removeSystemMessage(sysWaitingMsg);
  if(!response.ok)
  {
    //chatWindow.textContent = "Oops! Something went wrong, please try again.";
    appendSystemMessage('Oops! Something went wrong, please try again.', false);
    enableInput(true);
    return;
  }

  // Show message
  const data = await response.json();
  console.log(data);

  //chatWindow.innerHTML = data.choices[0].message.content;
  appendMessage(data.choices[0].message.content, 'bot');
  enableInput(true);
});

function delay(time)
{
  return new Promise(resolve => setTimeout(resolve, time));
}

function appendSystemMessage(content, italic)
{
  const entry = document.createElement('div');
  entry.className = `msg-entry system`;
  
  const bubble = document.createElement('div');
  bubble.className = 'msg-bubble';
  if(italic)
    bubble.classList.add('italic');
  bubble.textContent = content;

  entry.appendChild(bubble);
  chatWindow.appendChild(entry);

  return entry;
}

function appendMessage(content, sentBy)
{
  const entry = document.createElement('div');
  entry.className = `msg-entry ${sentBy}`;
  
  const authorTxt = document.createElement('span');
  authorTxt.className = 'msg-author';
  authorTxt.textContent = sentBy === 'user' ? 'You said:' : 'Smart Product Advisor said:';

  const bubble = document.createElement('div');
  bubble.className = 'msg-bubble';
  bubble.textContent = content;

  entry.appendChild(authorTxt);
  entry.appendChild(bubble);
  chatWindow.appendChild(entry);
}

async function removeSystemMessage(entry)
{
  // Hack to restart animations to make speech bubble visually shrink when deleted
  entry.children.item(0).style.animationName = 'none';
  entry.classList.add('hiding');
  void entry.offsetWidth;
  entry.children.item(0).style.animationName = null;
  await delay(250);
  entry.remove();
}

function enableInput(enabled)
{
  userInput.disabled = !enabled;
  userSubmit.disabled = !enabled;
}