/**
 * eyeSpy AI - Chatbot Kejahatan DIY
 * Menangani interaksi asinkron pengguna dengan model Groq AI untuk tanya jawab data kriminalitas DIY.
 */

document.addEventListener("DOMContentLoaded", function () {
    const chatForm = document.getElementById("chatbotForm");
    const chatInput = document.getElementById("chatbotInput");
    const chatMessages = document.getElementById("chatbotMessages");
    const chatTyping = document.getElementById("chatbotTyping");
    const clearBtn = document.getElementById("chatbotClearBtn");
    const sendBtn = document.getElementById("chatbotSendBtn");

    if (!chatForm || !chatInput || !chatMessages) {
        return;
    }

    // Riwayat percakapan untuk konteks memori chatbot
    let conversationHistory = [];

    // Helper: Escape teks HTML untuk mencegah XSS
    function escapeHtml(text) {
        const div = document.createElement("div");
        div.textContent = text;
        return div.innerHTML;
    }

    // Helper: Format teks balasan AI (Markdown sederhana -> HTML)
    function formatMessageText(text) {
        let safe = escapeHtml(text);

        // Bold (**teks**)
        safe = safe.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

        // Italic (*teks*)
        safe = safe.replace(/\*([^\*]+)\*/g, "<em>$1</em>");

        // Format baris per baris
        const lines = safe.split("\n");
        let formatted = [];
        let inList = false;

        for (let line of lines) {
            const trimmed = line.trim();

            // Headings (### atau ##)
            if (trimmed.startsWith("### ") || trimmed.startsWith("## ")) {
                if (inList) {
                    formatted.push("</ul>");
                    inList = false;
                }
                const headingText = trimmed.replace(/^#{2,3}\s*/, "");
                formatted.push("<h4 class='chat-heading'>" + headingText + "</h4>");
                continue;
            }

            // Bullet list (*, -, •, 1., 2.)
            const isBullet = trimmed.startsWith("&bull;") || trimmed.startsWith("•") || trimmed.startsWith("- ") || trimmed.startsWith("* ");
            const numMatch = trimmed.match(/^(\d+)[\.\)]\s+(.*)/);

            if (isBullet || numMatch) {
                let cleanLine = isBullet 
                    ? trimmed.replace(/^(&bull;|•|\-|\*)\s*/, "") 
                    : numMatch[2];

                if (!inList) {
                    formatted.push("<ul class='chat-list'>");
                    inList = true;
                }
                formatted.push("<li>" + cleanLine + "</li>");
            } else {
                if (inList) {
                    formatted.push("</ul>");
                    inList = false;
                }
                if (trimmed !== "") {
                    formatted.push("<p>" + trimmed + "</p>");
                }
            }
        }

        if (inList) {
            formatted.push("</ul>");
        }

        return formatted.length > 0 ? formatted.join("") : "<p>" + safe + "</p>";
    }

    // Helper: Scroll kotak pesan ke bagian paling bawah
    function scrollToBottom() {
        requestAnimationFrame(() => {
            chatMessages.scrollTop = chatMessages.scrollHeight;
        });
    }

    // Tambah gelembung pesan ke tampilan chat
    function appendMessage(role, text, isRawHtml = false) {
        const isUser = role === "user";
        const msgDiv = document.createElement("div");
        msgDiv.className = `chat-msg ${isUser ? "user-msg" : "bot-msg"}`;

        const avatarDiv = document.createElement("div");
        avatarDiv.className = `chat-avatar ${isUser ? "user-avatar" : "bot-avatar"}`;
        avatarDiv.innerHTML = isUser ? '<i class="uil uil-user"></i>' : '<i class="uil uil-robot"></i>';

        const bubbleDiv = document.createElement("div");
        bubbleDiv.className = "chat-bubble";

        if (isUser) {
            bubbleDiv.innerHTML = `<p>${escapeHtml(text)}</p>`;
        } else {
            bubbleDiv.innerHTML = isRawHtml ? text : formatMessageText(text);
        }

        msgDiv.appendChild(avatarDiv);
        msgDiv.appendChild(bubbleDiv);
        chatMessages.appendChild(msgDiv);

        scrollToBottom();
        return msgDiv;
    }

    // Tampilkan / sembunyikan status mengetik
    function setTyping(isTyping) {
        if (!chatTyping) return;
        if (isTyping) {
            chatTyping.style.display = "flex";
            chatInput.disabled = true;
            if (sendBtn) sendBtn.disabled = true;
            scrollToBottom();
        } else {
            chatTyping.style.display = "none";
            chatInput.disabled = false;
            if (sendBtn) sendBtn.disabled = false;
            chatInput.focus();
        }
    }

    // Eksekusi kirim pesan
    async function sendMessage(userText) {
        const query = userText.trim();
        if (!query) return;

        // 1. Tampilkan pesan user di chat
        appendMessage("user", query);
        chatInput.value = "";

        // 2. Simpan ke histori percakapan
        conversationHistory.push({ role: "user", content: query });

        // 3. Tampilkan indikator mengetik
        setTyping(true);

        try {
            const response = await fetch("llm/groqChat.php", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    message: query,
                    history: conversationHistory
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error ${response.status}`);
            }

            const data = await response.json();

            if (data.status === "ok" && data.reply) {
                appendMessage("assistant", data.reply);
                conversationHistory.push({ role: "assistant", content: data.reply });
            } else {
                const errMsg = data.message || "Maaf, terjadi kendala saat memproses jawaban.";
                appendMessage("assistant", `⚠️ **Terjadi Kendala:** ${errMsg}`);
            }
        } catch (err) {
            console.error("Chatbot request failed:", err);
            appendMessage(
                "assistant",
                "⚠️ **Koneksi Terputus:** Tidak dapat terhubung ke server analitik. Pastikan web server Apache dan koneksi internet aktif, lalu coba beberapa saat lagi."
            );
        } finally {
            setTyping(false);
        }
    }

    // Submit form pengiriman chat
    chatForm.addEventListener("submit", function (e) {
        e.preventDefault();
        const text = chatInput.value;
        if (text.trim() !== "") {
            sendMessage(text);
        }
    });

    // Delegasi klik pada suggestion chips (pertanyaan cepat)
    chatMessages.addEventListener("click", function (e) {
        const chip = e.target.closest(".suggestion-chip");
        if (chip) {
            const prompt = chip.getAttribute("data-prompt") || chip.textContent.trim();
            if (prompt) {
                sendMessage(prompt);
            }
        }
    });

    // Reset percakapan ketika tombol clear diklik
    if (clearBtn) {
        clearBtn.addEventListener("click", function () {
            conversationHistory = [];
            chatMessages.innerHTML = `
                <div class="chat-msg bot-msg">
                    <div class="chat-avatar bot-avatar">
                        <i class="uil uil-robot"></i>
                    </div>
                    <div class="chat-bubble">
                        <p>Riwayat percakapan telah dibersihkan. Saya siap menjawab pertanyaan seputar data kriminalitas DIY, lokasi titik rawan, atau rekomendasi keamanan.</p>
                        <div class="chat-suggestions">
                            <span class="suggestion-chip" data-prompt="Di mana titik lokasi paling rawan di DIY?">📍 Titik paling rawan?</span>
                            <span class="suggestion-chip" data-prompt="Kapan jam-jam paling rawan kejahatan terjadi?">🕒 Jam paling rawan?</span>
                            <span class="suggestion-chip" data-prompt="Bagaimana perbandingan kasus antara Sleman dan Kota Yogyakarta?">📊 Sleman vs Kota Jogja?</span>
                            <span class="suggestion-chip" data-prompt="Apa rekomendasi keamanan saat berkendara malam di Ringroad?">🛡️ Tips aman malam hari</span>
                        </div>
                    </div>
                </div>
            `;
            chatInput.value = "";
            chatInput.focus();
            scrollToBottom();
        });
    }
});
