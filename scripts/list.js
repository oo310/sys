// Firebase 配置
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getFirestore, collection, getDocs, doc, getDoc,addDoc,serverTimestamp  } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyDTzogyvt9OxwHYGjuTAbBtilg8rBn_YoY",
    authDomain: "test-45e2a.firebaseapp.com",
    projectId: "test-45e2a",
    storageBucket: "test-45e2a.appspot.com", 
    messagingSenderId: "498846669559",
    appId: "1:498846669559:web:efe3d17bd226fd6d1d51f2",
    measurementId: "G-8ZQGTJ2SJV"
};

// 初始化 Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// DOM 元素
const menu = document.getElementById("menu");
const container = document.getElementById("markdown-container");


// 動態載入教材列表
// async function loadLessons() {
//     const lessonsSnapshot = await getDocs(collection(db, "lessons"));
//     lessonsSnapshot.forEach((doc) => {
//         const lesson = doc.data();
//         console.log(lesson);
//         const button = document.createElement("button");
//         button.textContent = lesson.title;
//         button.onclick = () => loadLesson(doc.id);
//         menu.appendChild(button);
//     });
// }
// 載入教材內容
async function loadLessons() {
    const menu = document.getElementById('menu');
    const lessonsSnapshot = await getDocs(collection(db, "lessons"));
    
    lessonsSnapshot.forEach((doc) => {
      const lesson = doc.data();
      
      // Create lesson container
      const lessonContainer = document.createElement('div');
      lessonContainer.classList.add('lesson-item');
      
      // Create lesson header
      const lessonHeader = document.createElement('div');
      lessonHeader.classList.add('lesson-header');
      lessonHeader.textContent = lesson.title;
      
      // Create dropdown icon
      const dropdownIcon = document.createElement('span');
      dropdownIcon.innerHTML = '▼'; // Simple dropdown icon
      
      // Create details container
      const detailsContainer = document.createElement('div');
      detailsContainer.classList.add('lesson-details');
      detailsContainer.style.display = 'none';
      
      // Add description
      const description = document.createElement('p');
      description.innerHTML = marked.parse(lesson.content) || 'No description available';
    
      // Assemble the components
      lessonHeader.appendChild(dropdownIcon);
      detailsContainer.appendChild(description);
      lessonContainer.appendChild(lessonHeader);
      lessonContainer.appendChild(detailsContainer);
      
      // Add toggle functionality
      lessonHeader.addEventListener('click', () => {
        const isExpanded = detailsContainer.style.display === 'block';
        
        // Collapse all other lessons
        document.querySelectorAll('.lesson-details').forEach(details => {
          details.style.display = 'none';
        });
        
        // Toggle current lesson
        detailsContainer.style.display = isExpanded ? 'none' : 'block';
      });
      
      menu.appendChild(lessonContainer);
    });
  }


// 載入單個教材內容
// async function loadLesson(lessonId) {
//     const docRef = doc(db, "lessons", lessonId);
//     const docSnap = await getDoc(docRef);

//     if (docSnap.exists()) {
//         const lesson = docSnap.data();
//         container.innerHTML = marked.parse(lesson.content);
        
//     } else {
//         container.innerHTML = `<p style="color: red;">Error: Lesson not found</p>`;
//     }
// }

// 初始化
loadLessons();

function initializeAceEditor(editorId, modalId, theme = "ace/theme/crimson_editor", mode = "ace/mode/python", fontSize = 28) {
    // 初始化 Ace 編輯器
    const editor = ace.edit(editorId);
    editor.setTheme(theme); // 設置主題
    editor.session.setMode(mode); // 設置語法模式
    editor.setFontSize(fontSize); // 設置字體大小

    // 確保模態框顯示時，調整編輯器大小
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.addEventListener('shown.bs.modal', () => {
            editor.resize(); // 調整大小
        });
    }

    return editor; // 返回初始化後的編輯器實例
}

// 添加事件監聽器進行表單提交
document.addEventListener('DOMContentLoaded', () => {
    const Editor = initializeAceEditor("editor", "addExerciseModal");
    //教材視窗
    const submitButton = document.getElementById('submit-material');
    const titleInput = document.getElementById('title');
    const contentInput = document.getElementById('content');
    const statusElement = document.getElementById('status');
    //題目視窗
    const ex_submitButton = document.getElementById('submit-exercise');
    const ex_titleInput = document.getElementById('ex_title');
    const ex_tag = document.getElementById('ex_tag');
    const ex_contentInput = document.getElementById('ex_content');
    const ex_statusElement = document.getElementById('ex_status');
    const editor = ace.edit("editor");

    submitButton.addEventListener('click', async (e) => {
        e.preventDefault();

        // 檢查表單是否填寫完整
        if (!titleInput.value || !contentInput.value) {
            statusElement.textContent = '請填寫所有必填欄位';
            statusElement.classList.remove('text-success');
            statusElement.classList.add('text-danger');
            return;
        }

        try {
            // 準備文件數據
            const lessonData = {
                title: titleInput.value,
                content: contentInput.value,
                createdAt: serverTimestamp(), // 自動添加服務器時間戳
                lastUpdated: serverTimestamp()
            };

            // 使用 addDoc 自動生成唯一 ID
            await addDoc(collection(db, 'lessons'), lessonData);

            // 清空輸入框
            titleInput.value = '';
            contentInput.value = '';

            // 顯示成功消息
            statusElement.textContent = '教材上傳成功！';
            statusElement.classList.remove('text-danger');
            statusElement.classList.add('text-success');
            Swal.fire({ title: '成功!', text: '教材上傳成功！', icon: 'success', confirmButtonText: '好的' });

            // 關閉模態框
            const modalElement = document.getElementById('addMaterialModal');
            const modalInstance = bootstrap.Modal.getInstance(modalElement);
            modalInstance.hide();

        } catch (error) {
            console.error('上傳教材時出錯:', error);
            statusElement.textContent = `上傳失敗：${error.message}`;
            statusElement.classList.remove('text-success');
            statusElement.classList.add('text-danger');
        }
    });

    ex_submitButton.addEventListener('click', async (e) => {
        console.log(editor.getValue());
        e.preventDefault();

        // 檢查表單是否填寫完整
        if (!ex_titleInput.value || !ex_contentInput.value || !editor.getValue() || !ex_tag.value) {
            ex_statusElement.textContent = '請填寫所有必填欄位';
            ex_statusElement.classList.remove('text-success');
            ex_statusElement.classList.add('text-danger');
            return;
        }

        try {
            // 準備文件數據
            const quizData = {
                title: ex_titleInput.value,
                tag: ex_tag.value,
                question: ex_contentInput.value,
                code:editor.getValue(),
                createdAt: serverTimestamp(), // 自動添加服務器時間戳
                lastUpdated: serverTimestamp()
            };

            // 使用 addDoc 自動生成唯一 ID
            await addDoc(collection(db, 'quiz'), quizData);

            // 清空輸入框
            ex_titleInput.value = '';
            ex_contentInput.value = '';
            editor.setValue('');

            // 顯示成功消息
            ex_statusElement.textContent = '教材上傳成功！';
            ex_statusElement.classList.remove('text-danger');
            ex_statusElement.classList.add('text-success');
            Swal.fire({ title: '成功!', text: '教材上傳成功！', icon: 'success', confirmButtonText: '好的' });

            // 關閉模態框
            const modalElement = document.getElementById('addExerciseModal');
            const modalInstance = bootstrap.Modal.getInstance(modalElement);
            modalInstance.hide();

        } catch (error) {
            console.error('上傳教材時出錯:', error);
            ex_statusElement.textContent = `上傳失敗：${error.message}`;
            ex_statusElement.classList.remove('text-success');
            ex_statusElement.classList.add('text-danger');
        }
    });
});// Import the functions you need from the SDKs you want to use