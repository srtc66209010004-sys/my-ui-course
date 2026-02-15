// ==========================================
// script.js ฉบับแก้ไข (เชื่อมต่อ Google Sheets)
// ==========================================

const scriptURL = 'https://script.google.com/macros/s/AKfycbxRQxAH_uYPNsAniWdyTHpxWtGVkrjm4EBtKdvIc5oAx9rEYJJKgTvo645ojDtjtTQ/exec';
let currentScore = {};

document.addEventListener('DOMContentLoaded', () => {
    // ตั้งค่าปลดล็อควิดีโอ 1-9
    for(let i=1; i<=9; i++) {
        setupVideoUnlock(`video-${i}`, `quiz-container-${i}`, `lock-msg-${i}`);
    }
});

function setupVideoUnlock(videoId, quizContainerId, lockMsgId) {
    const video = document.getElementById(videoId);
    const quizContainer = document.getElementById(quizContainerId);
    const lockMsg = document.getElementById(lockMsgId);
    if (video && quizContainer && lockMsg) {
        video.onended = () => {
            lockMsg.style.display = 'none';
            quizContainer.style.display = 'block';
        };
    }
}

function calculateScore(lessonNum) {
    const form = document.getElementById('quiz-form-' + lessonNum);
    const resultBox = document.getElementById('result-box-' + lessonNum);
    if (!form || !resultBox) return;

    const questions = form.querySelectorAll('.quiz-item');
    const checked = form.querySelectorAll('input[type="radio"]:checked');

    if (checked.length < questions.length) {
        alert("กรุณาทำข้อสอบให้ครบทุกข้อก่อนครับ!");
        return;
    }

    let score = 0;
    checked.forEach(ans => score += parseInt(ans.value));
    currentScore[lessonNum] = score;

    document.getElementById('score-display-' + lessonNum).innerHTML = "คุณได้คะแนน <b>" + score + "</b> / " + questions.length;
    document.getElementById('quiz-container-' + lessonNum).style.display = "none";
    resultBox.style.display = "block";

    // ปลดล็อคบทถัดไป
    if (![3, 6, 9].includes(lessonNum)) {
        const nextLesson = document.getElementById('lesson-box-' + (lessonNum + 1));
        if (nextLesson) nextLesson.style.display = 'block';
    }
}

function submitFeedback(lessonNum) {
    const nameInput = document.getElementById('user-name');
    if (!nameInput || !nameInput.value) {
        alert("กรุณากรอกชื่อผู้เข้าเรียนด้านบนสุดก่อนครับ!");
        return;
    }

    const feedbackText = document.getElementById('user-feedback-' + lessonNum)?.value || "-";
    const ratingInput = document.querySelector(`input[name="rate${lessonNum}"]:checked`);
    const rating = ratingInput ? ratingInput.value : "ไม่ได้ระบุ";
    const score = currentScore[lessonNum] || 0;

    // เรียกฟังก์ชันส่งข้อมูล
    sendDataToBackend(lessonNum, score, rating, feedbackText);
}

function sendDataToBackend(lessonNum, score, rating, feedback) {
    const name = document.getElementById('user-name').value;
    const payload = {
        name: name,
        lesson: "บทที่ " + lessonNum,
        score: score,
        rating: rating,
        feedback: feedback
    };

    console.log("กำลังส่งข้อมูล...", payload);

    fetch(scriptURL, {
        method: 'POST',
        mode: 'no-cors', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    })
    .then(() => {
        alert("✅ บันทึกผลการเรียนและส่งความเห็นเรียบร้อย!");
        const feedbackArea = document.querySelector('#result-box-' + lessonNum + ' .feedback-area');
        if (feedbackArea) {
            feedbackArea.innerHTML = `<div style="background:#d4edda; color:#155724; padding:15px; border-radius:10px; text-align:center;"><strong>✅ ส่งข้อมูลสำเร็จ!</strong></div>`;
        }
        
        // โชว์ปุ่มไปต่อสำหรับบทที่ 3, 6, 9
        const map = {3: 'next-level-area-1', 6: 'next-level-area-2', 9: 'next-level-area-3'};
        if (map[lessonNum]) {
            document.getElementById(map[lessonNum]).style.display = 'block';
        }
    })
    .catch(err => alert("เกิดข้อผิดพลาด: " + err));
}