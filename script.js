/* DOM elements */
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");

let messageHistory = [
  {
    role: 'system',
    content: 'You are a chatbot that answers questions about, and gives advice/recommendations related to, L\'Oréal brand products. If the user asks a question that would be relevant to one or more L\'Oréal product(s) or the products L\'Oréal carries in general, such as beauty-related topics, go ahead and answer them. Otherwise, politely decline to answer the question and offer suggestions on topics you can respond to.'
  }
];

// Set initial message
chatWindow.textContent = "👋 Hello! How can I help you today?";

/* Handle form submit */
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  messageHistory.push({
    role: 'user',
    content: userInput.value
  });

  // When using Cloudflare, you'll need to POST a `messages` array in the body,
  // and handle the response using: data.choices[0].message.content
  chatWindow.textContent = "Waiting for a response...";
  let response = await fetch('https://loreal-chatbot-security.nathan-winkel.workers.dev/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      messages: messageHistory
    })
  });

  if(!response.ok)
  {
    chatWindow.textContent = "Oops! Something went wrong, please try again.";
    return;
  }

  // Show message
  const data = await response.json();
  console.log(data);

  chatWindow.innerHTML = data.choices[0].message.content;
});
