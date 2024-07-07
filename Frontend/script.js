document.addEventListener("DOMContentLoaded", () => {
    const chatWindow = document.getElementById("chat-window");

    const appendMessage = (message, sender) => {
        const messageElement = document.createElement("div");
        messageElement.className = `message ${sender}-message`;
        messageElement.innerText = message;
        chatWindow.appendChild(messageElement);
        chatWindow.scrollTop = chatWindow.scrollHeight;
    };

    window.sendMessage = async () => {
        const userInput = document.getElementById("user-input");
        const message = userInput.value.trim();
        if (message) {
            appendMessage(message, "user");
            userInput.value = "";

            try {
                const response = await fetch("/api/chat", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ userId: "123", message })
                });

                if (response.ok) {
                    const data = await response.json();
                    appendMessage(data.message, "bot");
                } else {
                    appendMessage("Error: Unable to get response from server.", "bot");
                }
            } catch (error) {
                appendMessage("Error: Unable to send message.", "bot");
            }
        }
    };
});
