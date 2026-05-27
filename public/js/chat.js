let conversations = [
  {
    id: 1,
    name: "Sarah M.",
    initials: "SM",
    subject: "Re: Blue Backpack",
    unread: 2,
    messages: [
      { id: 1, from: "them", text: "Hi! I think I found your backpack near the library. Is it a dark blue one with a red zipper?", time: "10:02 AM", date: "Today" },
      { id: 2, from: "me",   text: "Yes! That sounds exactly like mine. I lost it on Thursday morning.", time: "10:15 AM", date: "Today" },
      { id: 3, from: "them", text: "Great, I have it at the main campus lost & found desk. You can pick it up anytime before 5 PM.", time: "10:18 AM", date: "Today" },
      { id: 4, from: "them", text: "Do you need me to send a photo to confirm?", time: "10:19 AM", date: "Today" }
    ]
  },
  {
    id: 2,
    name: "James T.",
    initials: "JT",
    subject: "Student ID Card",
    unread: 0,
    messages: [
      { id: 1, from: "them", text: "Hello, I saw your post about the lost student ID. I found one in the cafeteria yesterday.", time: "Yesterday", date: "Yesterday" },
      { id: 2, from: "me",   text: "Oh wow, thank you so much! Can you describe it?", time: "Yesterday", date: "Yesterday" },
      { id: 3, from: "them", text: "It is in a clear plastic holder. The name on it starts with an A.", time: "Yesterday", date: "Yesterday" },
      { id: 4, from: "me",   text: "That is mine! I will come to the admin office to collect it.", time: "Yesterday", date: "Yesterday" },
      { id: 5, from: "them", text: "Perfect, I will leave it at the reception desk.", time: "Yesterday", date: "Yesterday" }
    ]
  },
  {
    id: 3,
    name: "TraceHub Support",
    initials: "TH",
    subject: "Welcome to TraceHub",
    unread: 1,
    messages: [
      { id: 1, from: "them", text: "Welcome to TraceHub! This is your messaging inbox. Use it to connect privately with people who may have found your items.", time: "2 days ago", date: "2 days ago" },
      { id: 2, from: "them", text: "Tip: Always meet in a public place when collecting lost items.", time: "2 days ago", date: "2 days ago" }
    ]
  }
];

let activeConvId = null;


function getLastMessage(conv) {
  return conv.messages.length ? conv.messages[conv.messages.length - 1] : null;
}

function renderConvList() {
  const list = document.getElementById("convList");

  list.innerHTML = conversations.map(conv => {
    const last     = getLastMessage(conv);
    const preview  = last ? (last.from === "me" ? "You: " : "") + last.text : conv.subject;
    const isActive = conv.id === activeConvId;

    return `
      <div class="conv-item ${isActive ? "active" : ""}" onclick="openConversation(${conv.id})">
        <div class="conv-avatar">${conv.initials}</div>
        <div class="conv-info">
          <div class="conv-name">${conv.name}</div>
          <div class="conv-preview">${preview}</div>
        </div>
        <div class="conv-meta">
          <span class="conv-time">${last ? last.time : ""}</span>
          ${conv.unread > 0 ? `<span class="conv-unread-badge">${conv.unread}</span>` : ""}
        </div>
      </div>
    `;
  }).join("");
}


function openConversation(id) {
  activeConvId  = id;
  const conv    = conversations.find(c => c.id === id);
  if (!conv) return;

  conv.unread = 0;

  document.getElementById("chatAvatar").textContent = conv.initials;
  document.getElementById("chatName").textContent   = conv.name;
  document.getElementById("chatSub").textContent    = conv.subject;

  renderMessages(conv);
  renderConvList();
}

function renderMessages(conv) {
  const area   = document.getElementById("chatMessages");
  let lastDate = null;

  area.innerHTML = conv.messages.map(msg => {
    let dateDivider = "";
    if (msg.date !== lastDate) {
      dateDivider = `<div class="chat-date-divider">${msg.date}</div>`;
      lastDate    = msg.date;
    }
    const isMe = msg.from === "me";

    return `
      ${dateDivider}
      <div class="msg-row ${isMe ? "outgoing" : "incoming"}">
        ${!isMe ? `<div class="msg-mini-avatar">${conv.initials}</div>` : ""}
        <div class="msg-bubble">${msg.text}</div>
        <span class="msg-time">${msg.time}</span>
      </div>
    `;
  }).join("");

  area.scrollTop = area.scrollHeight;
}

document.addEventListener("DOMContentLoaded", () => {
  renderConvList();
  if (conversations.length) openConversation(conversations[0].id);
});