// ======== Функция для отображения сообщений ========
function showMessage(message) {
    alert(message);
}
// burger-menu
function toggleMenu() {
    const menu = document.getElementById("menu");
    if (menu) {
        menu.classList.toggle("active");
    }
}

// ======== Локальное хранилище для событий ========
let events = JSON.parse(localStorage.getItem("events")) || [];

// ======== Регистрация пользователя ========
document.addEventListener("DOMContentLoaded", () => {
    const registerForm = document.getElementById("registerForm");
    if (registerForm) {
        registerForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const username = document.getElementById("username").value.trim();
            const email = document.getElementById("email").value.trim();
            const password = document.getElementById("password").value;
            const confirmPassword = document.getElementById("confirmPassword").value;

            if (password !== confirmPassword) {
                showMessage("Пароли не совпадают!");
                return;
            }

            const users = JSON.parse(localStorage.getItem("users")) || [];
            if (users.some(user => user.email === email)) {
                showMessage("Пользователь с таким email уже существует!");
                return;
            }

            users.push({ username, email, password });
            localStorage.setItem("users", JSON.stringify(users));
            showMessage("Регистрация успешна! Теперь войдите.");
            window.location.href = "login.html";
            });
        }
    });

    // ======== Вход пользователя ========
    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
        loginForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const email = document.getElementById("email").value.trim();
            const password = document.getElementById("password").value;

            const users = JSON.parse(localStorage.getItem("users")) || [];
            const user = users.find(user => user.email === email && user.password === password);

            if (user) {
                localStorage.setItem("loggedInUser", JSON.stringify(user));
                showMessage("Вход успешен!");
                window.location.href = "events.html";
            } else {
                showMessage("Неверные данные!");
            }
        });
    }
// ======== Добавление события ========
function addEvent(title, description, date) {
    const event = {
        id: Date.now(), // Уникальный ID для каждого события
        title,
        description,
        date,
        participants: []
    };
    events.push(event);
    localStorage.setItem("events", JSON.stringify(events));
    renderEvents();
    renderAdminEvents();
}

// ======== Удаление события ========
function deleteEvent(id) {
    events = events.filter(event => event.id !== id);
    localStorage.setItem("events", JSON.stringify(events));
    renderEvents();
    renderAdminEvents();
}
// ======== Редактирование события ========
function editEvent(id, newTitle, newDescription, newDate) {
    const event = events.find(event => event.id === id);
    if (event) {
        event.title = newTitle;
        event.description = newDescription;
        event.date = newDate;
        localStorage.setItem("events", JSON.stringify(events));
        renderEvents();
        renderAdminEvents();
    }
}

// ======== Отображение событий на странице событий ========
const eventsList = document.getElementById("eventsList");
if (eventsList) {
    renderEvents();
}

// ======== Показ сохраненного снимка ========
const savedImage = document.getElementById("savedImage");
if (savedImage) {
    showSnapshot();
}

// ======== Модальное окно для редактирования ========
function openEditModal(id) {
    const event = events.find(event => event.id === id);
    if (event) {
        const newTitle = prompt("Введите новое название:", event.title);
        const newDescription = prompt("Введите новое описание:", event.description);
        const newDate = prompt("Введите новую дату (YYYY-MM-DD):", event.date);

        if (newTitle && newDescription && newDate) {
            editEvent(id, newTitle, newDescription, newDate);
        }
    }
}
// ======== Вступление в событие ========
function joinEvent(id) {
    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
    if (!loggedInUser) {
        showMessage("Вы должны войти в систему, чтобы вступить в событие!");
        window.location.href = "login.html";
        return;
    }

    const event = events.find(event => event.id === id);
    if (event && !event.participants.includes(loggedInUser.username)) {
        event.participants.push(loggedInUser.username);
        localStorage.setItem("events", JSON.stringify(events));
        renderEvents();
    }
}

// ======== Рендеринг событий для пользователей ========
function renderEvents() {
    const eventsList = document.getElementById("eventsList");
    if (eventsList) {
        eventsList.innerHTML = "";
        events.forEach(event => {
            const eventElement = document.createElement("div");
            eventElement.classList.add("event-card");
            eventElement.innerHTML = `
                <h3>${event.title}</h3>
                <p>${event.description}</p>
                <p><strong>Дата:</strong> ${event.date}</p>
                <button onclick="joinEvent(${event.id})">Вступить</button>
                <button onclick="window.open('https://zoom.us', '_blank')">Перейти на Zoom</button>
                <p><strong>Участники:</strong> ${event.participants.join(", ") || "Нет участников"}</p>
            `;
            eventsList.appendChild(eventElement);
        });
    }
}
// ======== Рендеринг событий для админа ========
function renderAdminEvents() {
    const adminEventsList = document.getElementById("adminEventsList");
    if (adminEventsList) {
        adminEventsList.innerHTML = "";
        events.forEach(event => {
            const eventElement = document.createElement("div");
            eventElement.classList.add("event-card");
            eventElement.innerHTML = `
                <h3>${event.title}</h3>
                <p>${event.description}</p>
                <p><strong>Дата:</strong> ${event.date}</p>
                <button onclick="deleteEvent(${event.id})">Удалить</button>
                <button onclick="openEditModal(${event.id})">Редактировать</button>
            `;
            adminEventsList.appendChild(eventElement);
        });
    }
}
// ======== Запуск камеры ========
navigator.mediaDevices.getUserMedia({
    video: { facingMode: "user" }, // Используем только фронтальную камеру (веб-камеру)
    audio: false
})
.then(stream => {
    let video = document.createElement("video");
    video.srcObject = stream;
    video.autoplay = true;
    document.body.appendChild(video);
})
.catch(error => {
    console.error("Ошибка доступа к веб-камере:", error);
});


// ======== Остановка камеры ========
function stopCamera() {
    if (cameraStream) {
        const tracks = cameraStream.getTracks();
        tracks.forEach(track => track.stop());
        cameraStream = null;
    }
}

// ======== Показ сообщения ========
function showMessage(message) {
    alert(message); // Простая реализация, можно заменить на более сложную
}

// ======== Сделать снимок ========
function takeSnapshot() {
    const video = document.getElementById("cameraFeed");
    const canvas = document.getElementById("snapshotCanvas");
    const context = canvas.getContext("2d");

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = canvas.toDataURL("image/png");
    localStorage.setItem("snapshot", imageData);
    showMessage("Снимок сохранен!");
    showSnapshot();
}

// ======== Показать сохраненный снимок ========
function showSnapshot() {
    const snapshot = localStorage.getItem("snapshot");
    if (snapshot) {
        document.getElementById("savedImage").src = snapshot;
    }
}
// ======== Выход пользователя ========
function logout() {
    localStorage.removeItem("loggedInUser");
    alert("Вы вышли из системы.");
    window.location.href = "login.html";
}

// ======== Проверка статуса входа ========
function checkLoginStatus() {
    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
    if (!loggedInUser) {
        alert("Вы не авторизованы! Пожалуйста, войдите в систему.");
        window.location.href = "login.html";
    }
}

// ======== Отображение информации о пользователе ========
function displayUserInfo() {
    const userInfo = document.getElementById("userInfo");
    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
    if (userInfo && loggedInUser) {
        userInfo.innerHTML = `Вы вошли как: ${loggedInUser.username}`;
    }
}

// ======== Добавление публикации ========
document.addEventListener("DOMContentLoaded", () => {
    const publishForm = document.getElementById("publishForm");
    if (publishForm) {
        publishForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const postText = document.getElementById("postText").value.trim();
            const postImage = document.getElementById("postImage").files[0];

            if (postText || postImage) {
                const reader = new FileReader();
                reader.onload = function (e) {
                    const post = {
                        text: postText,
                        image: e.target.result
                    };
                    savePost(post);
                    renderPosts();
                };
                if (postImage) {
                    reader.readAsDataURL(postImage);
                } else {
                    savePost({ text: postText, image: null });
                    renderPosts();
                }
                publishForm.reset();
            } else {
                showMessage("Пожалуйста, введите текст или добавьте изображение.");
            }
        });
    }
});

function savePost(post) {
    const posts = JSON.parse(localStorage.getItem("posts")) || [];
    posts.push(post);
    localStorage.setItem("posts", JSON.stringify(posts));
}

function renderPosts() {
    const postsList = document.getElementById("postsList");
    if (postsList) {
        postsList.innerHTML = "";
        const posts = JSON.parse(localStorage.getItem("posts")) || [];
        posts.forEach((post, index) => {
            const postElement = document.createElement("div");
            postElement.classList.add("post");
            postElement.innerHTML = `
                <p>${post.text}</p>
                ${post.image ? `<img src="${post.image}" alt="Пост ${index + 1}">` : ""}
                <button onclick="deletePost(${index})">Удалить</button>
            `;
            postsList.appendChild(postElement);
        });
    }
}

function deletePost(index) {
    const posts = JSON.parse(localStorage.getItem("posts")) || [];
    posts.splice(index, 1);
    localStorage.setItem("posts", JSON.stringify(posts));
    renderPosts();
}


// ======== Инициализация ========
document.addEventListener("DOMContentLoaded", () => {
    const eventForm = document.getElementById("eventForm");
    if (eventForm) {
        eventForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const title = document.getElementById("eventTitle").value.trim();
            const description = document.getElementById("eventDescription").value.trim();
            const date = document.getElementById("eventDate").value;
            addEvent(title, description, date);
            eventForm.reset();
        });
    }

    renderEvents();
    renderAdminEvents(); // Добавляем вызов здесь
});