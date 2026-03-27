const db = require("../../config/db");
const { jwtVerify } = require("../../jwt/jwt");

// 🔥 append function
function processHTML(html) {

    // =========================
    // 1. builder append
    // =========================
    const builderPattern = /<script>\s*\/\/asdfg1\s*<\/script>/;

    const builderScript = `<script id="builder-logic">


        document.addEventListener("DOMContentLoaded", () => {
            document.querySelectorAll(".section li, .section h2").forEach(el => {
                el.contentEditable = true;
            });

            const photo = document.getElementById("photo");
            if (photo) {
                const input = document.createElement("input");
                input.type = "file";
                input.accept = "image/*";
                input.style.display = "block";
                input.style.margin = "10px auto";
                photo.after(input);
                input.onchange = function () {
                    const reader = new FileReader();
                    reader.onload = e => photo.style.backgroundImage = \`url(\${e.target.result})\`;
                    reader.readAsDataURL(this.files[0]);
                    // 🔥 Store file for upload
                    window.selectedImageFile = this.files[0];
                };
            }

            document.querySelectorAll(".section").forEach(section => {
                const control = document.createElement("div");
                control.style.marginBottom = "10px";
                control.innerHTML = \`
                    <button onclick="addSectionAbove(this.parentElement.parentElement)">add section above</button>
                    <button onclick="deleteElement(this.parentElement.parentElement)">delete section</button>
                    <button onclick="addLine(this.parentElement.parentElement)">add line</button>
                \`;
                section.prepend(control);

                section.querySelectorAll("li").forEach(li => {
                    const btns = document.createElement("span");
                    btns.innerHTML = \`
                        <button onclick="this.parentElement.parentElement.remove()">delete</button>
                        <button onclick="addSubline(this.parentElement.parentElement)">subline</button>
                    \`;
                    li.appendChild(btns);
                });
            });
        });

        function addLine(section) {
            const ul = section.querySelector("ul");
            const li = document.createElement("li");
            li.contentEditable = true;
            li.innerHTML = \`New line <span><button onclick="this.parentElement.parentElement.remove()">delete</button><button onclick="addSubline(this.parentElement.parentElement)">subline</button></span>\`;
            ul.appendChild(li);
        }

        function addSubline(li) {
            let sub = li.querySelector("ul") || document.createElement("ul");
            if (!li.querySelector("ul")) li.appendChild(sub);
            const newLine = document.createElement("li");
            newLine.contentEditable = true;
            newLine.innerHTML = \`New subline <span><button onclick="this.parentElement.parentElement.remove()">delete</button></span>\`;
            sub.appendChild(newLine);
        }

        function deleteElement(el) { el.remove(); }
        function addSectionAbove(section) {
            const newSec = section.cloneNode(true);
            section.before(newSec);
        }

        document.addEventListener("DOMContentLoaded", () => {
            const span = document.querySelector(".typewriter");
            if (span) {
                span.addEventListener("dblclick", () => {
                    const currentWordsStr = span.getAttribute('data-words') || words.join(",");
                    const newWords = prompt("Edit words (comma separated):", currentWordsStr);

                    if (newWords) {
                        span.setAttribute('data-words', newWords);
                        words = newWords.split(",");
                        i = 0;
                        j = 0;
                        isDeleting = false;
                        alert("Updated! Now click Save.");
                    }
                });
            }
        });

        document.addEventListener("DOMContentLoaded", () => {

            const span = document.querySelector(".typewriterr");

            if (span) {

                span.addEventListener("dblclick", () => {

                    const current = span.getAttribute("data-lines");

                    const newText = prompt(
                        "Edit intro (use | between lines)",
                        current
                    );

                    if (newText) {

                        span.setAttribute("data-lines", newText);

                        lines = newText.split("|");

                        lineIndex = 0;
                        charIndex = 0;
                        span.innerHTML = "";

                        typeOnce();
                    }
                });

            }

        });


    </script>`;

    if (builderPattern.test(html) && !html.includes('id="builder-logic"')) {
        html = html.replace(builderPattern, match => match + "\n" + builderScript);
    }

    // =========================
    // 2. navbar append
    // =========================
    const navPattern = /<p\s+id="asdfg"><\/p>/;

    const navHTML = `<header id="navbar">
        <nav style="
        width:100%;
        display:flex;
        align-items:center;
        justify-content:center;
        position:relative;
    ">
        <!-- center -->
        <button onclick="saveWebsite()">Save</button>

        <!-- right -->
       <button onclick="window.location.href='../setting'" style="
    position:absolute;
    right:20px;
    font-size:18px;
    background:none;
    border:none;
    cursor:pointer;
">⚙️</button>
    </nav>
    </header>`;

    if (navPattern.test(html) && !html.includes('id="navbar"')) {
        html = html.replace(navPattern, match => match + "\n" + navHTML);
    }

    // =========================
    // 3. save script append
    // =========================
    const savePattern = /<script>\s*\/\/asdfg2\s*<\/script>/;

    const saveScript = `<script id="save-logic">
        async function saveWebsite() {
            const clone = document.documentElement.cloneNode(true);

            // ১. টাইপরাইটার এবং অপ্রয়োজনীয় UI ক্লিন করা
            const sSpan = clone.querySelector('.typewriterr');
            const tSpan = clone.querySelector('.typewriter');
            if (sSpan) sSpan.innerHTML = "";
            if (tSpan) tSpan.textContent = "";

            // ২. বিল্ডার লজিক এবং সেভ লজিক স্ক্রিপ্ট মুছে ফেলা (নিরাপত্তার জন্য)
            const builderScript = clone.querySelector('#builder-logic');
            if (builderScript) builderScript.remove();
            const saveScript = clone.querySelector('#save-logic');
            if (saveScript) saveScript.remove();

            // ৩. নেভিবার এবং বাটন মুছে ফেলা
            const nav = clone.querySelector("#navbar");
            if (nav) nav.remove();
            clone.querySelectorAll("button, input, .builder-ui").forEach(el => el.remove());

            // ৪. এডিট মোড ডিজেবল করা
            clone.querySelectorAll('[contenteditable="true"]').forEach(el => {
                el.removeAttribute("contenteditable");
                el.style.outline = "none";
            });

            const finalCode = "<!DOCTYPE html>\\n" + clone.outerHTML;

            // 🔥 URL থেকে data (UPDATED)
            const params = new URLSearchParams(window.parent.location.search);
            const username = params.get("username");
            const link = params.get("link");

            if (!username || !link) {
                alert("Missing username or link in URL!");
                return;
            }

            const formData = new FormData();
            formData.append("username", username);
            formData.append("link", link);
            formData.append("code_text", finalCode);
            // 🔥 Image file if selected
            if (window.selectedImageFile) {
                formData.append("image", window.selectedImageFile);
            }

            try {
                const response = await fetch("http://localhost:4341/api/web_create_by_template", {
                    method: "POST",
                    body: formData
                });

                const result = await response.json();
                  if (result.message && result.message.toLowerCase().includes("unauthorized")) {
                    localStorage.clear();
                    window.location.href = "../";
                }

                if (response.ok && result.link) {
                    alert("Successfully Saved! Your link: http://localhost:4341/@" + result.link);
                    window.open("http://localhost:4341/@" + result.link, "_blank");
                } else {
                    alert("Error: " + (result.msg || "Save failed"));
                }
            } catch (err) {
                console.error("Save error:", err);
                alert("Could not connect to the server.");
            }
        }
    </script>`;

    if (savePattern.test(html) && !html.includes('id="save-logic"')) {
        html = html.replace(savePattern, match => match + "\n" + saveScript);
    }

    return html;
}


// =========================
// MAIN
// =========================
exports.view_edit_Website = async (req, res) => {
    const { link, username, token } = req.body;

    try {
        if (!jwtVerify(token)) {
            return res.status(401).json({ message: "Unauthorized" });
        } const conn = await db;

        const [rows] = await conn.query(
            "SELECT code_text FROM website_model WHERE link = ? AND username = ?",
            [link, username]
        );

        if (rows.length === 0) {
            return res.status(404).send("Website not found");
        }

        let html = rows[0].code_text;

        html = processHTML(html);

        res.set("Content-Type", "text/html");
        res.send(html);

    } catch (e) {
        console.error(e);
        res.status(500).send("Server error");
    }
};