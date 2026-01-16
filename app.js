// ================= ДАННЫЕ РЕПЕТИТОРОВ =================
const TUTORS = [
    { 
        id: 1, 
        name: 'Айгерим Нурланова', 
        subject: 'Математика', 
        university: 'КазНУ им. аль-Фараби',
        price: 6000, 
        rating: 4.9, 
        reviews: 48, 
        desc: 'Красный диплом КазНУ. Готовлю к ЕНТ и олимпиадам. Объясняю сложные темы простым языком.', 
        tags: ['алгебра','геометрия','ент','математика','олимпиада'], 
        schedule: 'Пн, Ср, Пт: 15:00 - 20:00'
    },
    { 
        id: 2, 
        name: 'Алмас Сериков', 
        subject: 'Физика', 
        university: 'КИМЭП',
        price: 5500, 
        rating: 4.8, 
        reviews: 35, 
        desc: 'Призёр олимпиад. Специализируюсь на ЕНТ и поступлении в технические вузы.', 
        tags: ['физика','механика','ент','технический'], 
        schedule: 'Вт, Чт: 16:00 - 21:00' 
    },
    { 
        id: 3, 
        name: 'Дарья Петрова', 
        subject: 'Английский', 
        university: 'Абай атындағы ҚазҰПУ',
        price: 5000, 
        rating: 4.9, 
        reviews: 52, 
        desc: 'Сертифицированный преподаватель (IELTS 8.0). Ставлю базу и готовлю к экзаменам.', 
        tags: ['английский','english','ielts','toefl','ent'], 
        schedule: 'Пн-Пт: 14:00 - 20:00' 
    },
    { 
        id: 4, 
        name: 'Нұржан Байділдаев', 
        subject: 'Химия', 
        university: 'КазНМУ',
        price: 4500, 
        rating: 4.7, 
        reviews: 28, 
        desc: 'Студент мед. университета. Отлично знаю органику, помогу подтянуть школьную программу недорого.', 
        tags: ['химия','органика','ент','медицина'], 
        schedule: 'Ср, Пт, Сб: 17:00 - 21:00' 
    },
    { 
        id: 5, 
        name: 'Мадина Жұмабекова', 
        subject: 'Математика', 
        university: 'КБТУ',
        price: 7000, 
        rating: 5.0, 
        reviews: 41, 
        desc: 'Профильный уровень. Подготовка к SAT, NUET и поступлению в топовые вузы.', 
        tags: ['математика','sat','ент','высшая математика'], 
        schedule: 'Пн-Чт: 16:00 - 21:00' 
    }
];

const WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbyOuAJ8ChSBsME3E5cP7_H9TSbxz229b';

// ================= БРЕНДИНГ И ИНИЦИАЛИЗАЦИЯ =================
const tg = window.Telegram?.WebApp;
if (tg) {
    tg.ready();
    tg.expand();
}

// Автоматическая смена заголовка на BilimHub
document.addEventListener('DOMContentLoaded', () => {
    const headerTitle = document.querySelector('.header h1');
    if (headerTitle) headerTitle.textContent = '🎓 BilimHub';
    
    renderTutors(TUTORS);
});

// ================= РЕНДЕР КАРТОЧЕК =================
function renderTutors(list) {
    const container = document.getElementById('tutorList');
    const emptyState = document.getElementById('emptyState');
    
    if (!container) return;
    container.innerHTML = '';
    
    if (list.length === 0) {
        emptyState?.classList.remove('hidden');
        return;
    }
    emptyState?.classList.add('hidden');

    list.forEach(tutor => {
        const card = document.createElement('div');
        card.className = 'tutor-card';
        card.style.cssText = 'background: rgba(255,255,255,0.1); padding: 15px; border-radius: 12px; margin-bottom: 10px; cursor: pointer; color: white; border: 1px solid rgba(255,255,255,0.2);';
        
        card.onclick = () => openModal(tutor);
        
        card.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: start;">
                <div>
                    <div style="font-weight: bold; font-size: 18px;">${tutor.name}</div>
                    <div style="font-size: 14px; opacity: 0.8; margin-top: 4px;">${tutor.subject} • ${tutor.university}</div>
                </div>
                <div style="background: #feb47b; color: #333; padding: 2px 8px; border-radius: 6px; font-weight: bold; font-size: 14px;">
                    ⭐ ${tutor.rating}
                </div>
            </div>
            <div style="margin-top: 12px; font-weight: 600; color: #fff;">
                ${tutor.price.toLocaleString()} ₸/час
            </div>
        `;
        container.appendChild(card);
    });
}

// ================= ЛОГИКА ИИ (BILIMHUB AI) =================

function findMatches(text) {
    const lowerText = text.toLowerCase();
    
    let subject = null;
    if (lowerText.includes('матем') || lowerText.includes('алгебр')) subject = 'Математика';
    else if (lowerText.includes('физик')) subject = 'Физика';
    else if (lowerText.includes('хими')) subject = 'Химия';
    else if (lowerText.includes('англ') || lowerText.includes('english')) subject = 'Английский';

    let intent = [];
    if (lowerText.includes('ент')) intent.push('ент');
    if (lowerText.includes('ielts') || lowerText.includes('toefl')) intent.push('ielts');
    if (lowerText.includes('sat') || lowerText.includes('nuet')) intent.push('sat');
    if (lowerText.includes('вуз') || lowerText.includes('поступ')) intent.push('поступление');
    
    // Приоритеты пользователя
    let priority = 'balance'; // balance, cheap, quality
    if (lowerText.includes('дешев') || lowerText.includes('недорого') || lowerText.includes('бюджет')) priority = 'cheap';
    if (lowerText.includes('лучш') || lowerText.includes('топ') || lowerText.includes('профи') || lowerText.includes('дорог')) priority = 'quality';

    return { subject, intent, priority };
}

function generateSmartReply(userText) {
    const { subject, intent, priority } = findMatches(userText);
    
    // 1. Приветствие
    let response = `Приветствую! 👋 Рад помочь с выбором в BilimHub.<br><br>`;

    // 2. Если запрос пустой
    if (!subject && intent.length === 0 && priority === 'balance') {
        return `Привет! Я ИИ-ассистент <b>BilimHub</b>. 🤖<br>
        Чтобы я подобрал идеального преподавателя, уточните:<br>
        1. Какой предмет нужен?<br>
        2. К чему готовимся (ЕНТ, IELTS, для себя)?<br>
        3. Что важнее: <b>цена</b> или <b>опыт</b>?`;
    }

    // 3. Скорринг и Фильтрация
    let candidates = TUTORS.map(tutor => {
        let score = 0;
        if (subject && tutor.subject === subject) score += 50;
        
        // Теги
        intent.forEach(tag => {
            if (tutor.tags.some(t => t.includes(tag))) score += 20;
        });

        // Логика цены/качества
        if (priority === 'cheap' && tutor.price < 5500) score += 15;
        if (priority === 'quality' && tutor.rating >= 4.9) score += 15;

        return { ...tutor, score };
    }).filter(t => t.score > 0);

    // Сортировка
    candidates.sort((a, b) => {
        if (priority === 'cheap') return (b.score - a.score) || (a.price - b.price); // Сначала очки, потом цена ниже
        if (priority === 'quality') return (b.score - a.score) || (b.rating - a.rating); // Сначала очки, потом рейтинг
        return b.score - a.score;
    });

    if (candidates.length === 0) {
        return `Пока не нашел точного совпадения. Попробуйте выбрать предмет в меню сверху или напишите проще, например: <b>"Математика ЕНТ"</b>.`;
    }

    const topTutor = candidates[0];

    // 4. Краткий вывод (Совет + Выбор)
    if (intent.includes('ielts')) {
        response += `💡 <i>Совет: К IELTS лучше начинать готовиться заранее, упор на Speaking.</i><br><br>`;
    } else if (intent.includes('ент')) {
        response += `💡 <i>Совет: Для ЕНТ важна системность. Начинайте сейчас, чтобы не стрессовать весной.</i><br><br>`;
    }

    if (priority === 'cheap') {
        response += `С учетом бюджета, оптимальный вариант — <b>${topTutor.name}</b>. Хорошая база за доступную цену.<br><br>`;
    } else if (priority === 'quality') {
        response += `Вы искали профессионала. <b>${topTutor.name}</b> — топ-репетитор с самым высоким рейтингом и опытом.<br><br>`;
    } else {
        response += `Исходя из ваших целей, лучше всего подойдет <b>${topTutor.name}</b>.<br><br>`;
    }

    // 5. Рекомендация
    response += `👤 <b>${topTutor.name}</b><br>`;
    response += `✅ Закрывает задачу: <b>${topTutor.subject}</b><br>`;
    response += `💰 ${topTutor.price} ₸/час<br>`;
    response += `💬 <i>"${topTutor.desc}"</i><br><br>`;

    // 6. Комбинация (Допродажа)
    if (subject === 'Физика' && intent.includes('ент')) {
        const mathTutor = TUTORS.find(t => t.subject === 'Математика' && t.price <= topTutor.price + 1000);
        if (mathTutor) {
            response += `⚡ <b>Эффективная комбинация:</b><br>
            Для тех. специальностей физика идет рука об руку с математикой. Рекомендую взять пару занятий у <b>${mathTutor.name}</b>, чтобы подтянуть вычисления.`;
        }
    }

    return response;
}

// ================= ИНТЕРФЕЙС ЧАТА =================
const aiModal = document.getElementById('aiModal');
const chatBox = document.getElementById('aiChat');
const aiInput = document.getElementById('aiInput');
const aiSendBtn = document.getElementById('aiSendBtn');

// Инициализация при открытии
document.getElementById('aiAssistantBtn').onclick = () => {
    aiModal.classList.add('active');
    // Если чат пустой, бот начинает первым
    if (chatBox.children.length <= 1) { // 1 потому что там может быть дефолтное приветствие из HTML
        chatBox.innerHTML = ''; // Очищаем старое
        addMessage(`Привет! 👋 Я <b>BilimHub AI</b>.<br>Помогу выбрать репетитора. Какой предмет или экзамен на носу?`, 'assistant');
        showChips();
    }
};

document.getElementById('closeAiModal').onclick = () => aiModal.classList.remove('active');

function addMessage(text, sender) {
    const div = document.createElement('div');
    div.className = `ai-message ${sender}`;
    div.innerHTML = text;
    chatBox.appendChild(div);
    chatBox.scrollTop = chatBox.scrollHeight;
}

// Кнопки быстрых ответов (Chips)
function showChips() {
    // Удаляем старые чипсы если есть
    const oldChips = document.querySelector('.chat-chips');
    if (oldChips) oldChips.remove();

    const chipsContainer = document.createElement('div');
    chipsContainer.className = 'chat-chips';
    
    const options = [
        { text: '💰 Недорого', query: 'недорого' },
        { text: '💎 Нужен ТОП', query: 'топ репетитор' },
        { text: '🇬🇧 IELTS', query: 'английский ielts' },
        { text: '📚 ЕНТ', query: 'подготовка к ент' },
        { text: '🧮 Математика', query: 'математика' }
    ];

    options.forEach(opt => {
        const btn = document.createElement('div');
        btn.className = 'chat-chip';
        btn.textContent = opt.text;
        btn.onclick = () => handleUserAction(opt.query);
        chipsContainer.appendChild(btn);
    });

    chatBox.appendChild(chipsContainer);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function handleUserAction(text) {
    // Удаляем чипсы после выбора
    const oldChips = document.querySelector('.chat-chips');
    if (oldChips) oldChips.remove();

    addMessage(text, 'user');
    
    // Анимация печати
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'ai-message assistant';
    loadingDiv.innerHTML = '<span class="typing-dots">...</span>';
    chatBox.appendChild(loadingDiv);

    setTimeout(() => {
        loadingDiv.remove();
        const reply = generateSmartReply(text);
        addMessage(reply, 'assistant');
    }, 800);
}

aiSendBtn.onclick = () => {
    const text = aiInput.value.trim();
    if (!text) return;
    
    aiInput.value = '';
    handleUserAction(text);
};

// ================= МОДАЛКА И ЗАПИСЬ =================
const modal = document.getElementById('tutorModal');

function openModal(tutor) {
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    const contactBtn = document.getElementById('contactTutorBtn');

    if (modalTitle) modalTitle.textContent = tutor.name;
    if (modalBody) {
        modalBody.innerHTML = `
            <p style="margin-bottom: 8px;"><strong>📚 Предмет:</strong> ${tutor.subject}</p>
            <p style="margin-bottom: 8px;"><strong>🏛 Вуз:</strong> ${tutor.university}</p>
            <p style="margin-bottom: 8px;"><strong>📝 О себе:</strong><br>${tutor.desc}</p>
            <p style="margin-bottom: 8px;"><strong>📅 Расписание:</strong><br>${tutor.schedule}</p>
            <hr style="border-color: rgba(255,255,255,0.2); margin: 15px 0;">
            <p style="font-size: 18px;"><strong>💰 Цена:</strong> ${tutor.price} ₸</p>
        `;
    }

    contactBtn.onclick = () => contactTutor(tutor);
    modal?.classList.add('active');
}

document.getElementById('closeModal').onclick = () => modal?.classList.remove('active');

function contactTutor(tutor) {
    const btn = document.getElementById('contactTutorBtn');
    const originalText = btn.innerHTML;
    btn.innerHTML = '⏳ Отправка...';
    
    const data = {
        action: 'booking',
        user: tg?.initDataUnsafe?.user?.first_name || 'Гость',
        tutor: tutor.name,
        subject: tutor.subject
    };

    fetch(WEBHOOK_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    }).then(() => {
        if (tg?.showAlert) tg.showAlert('✅ Заявка отправлена!');
        else alert('✅ Заявка успешно отправлена!');
        modal?.classList.remove('active');
        btn.innerHTML = originalText;
    }).catch(() => {
        alert('Ошибка связи.');
        btn.innerHTML = originalText;
    });
}

// ================= ЗАПУСК =================
document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.onclick = (e) => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        const sub = e.target.dataset.subject;
        renderTutors(sub === 'all' ? TUTORS : TUTORS.filter(t => t.subject === sub));
    };
});

document.getElementById('searchInput').oninput = (e) => {
    const val = e.target.value.toLowerCase();
    const filtered = TUTORS.filter(t => 
        t.name.toLowerCase().includes(val) || t.subject.toLowerCase().includes(val)
    );
    renderTutors(filtered);
};