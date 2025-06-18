const saveBtn = document.getElementById("saveBtn");
const diaryInput = document.getElementById("diaryInput");
const diaryList = document.getElementById("diaryList");

// ローカルストレージから読み込み
function loadDiaries() {
  diaryList.innerHTML = "";
  const diaries = JSON.parse(localStorage.getItem("diaries")) || [];
  diaries.forEach((entry, index) => {
    const li = document.createElement("li");
    li.textContent = `${entry.date} - ${entry.text.substring(0, 20)}...`;
    li.addEventListener("click", () => {
      alert(`📓 ${entry.date}\n\n${entry.text}`);
    });
    diaryList.appendChild(li);
  });
}

// 保存処理
saveBtn.addEventListener("click", () => {
  const text = diaryInput.value.trim();
  if (!text) return alert("日記の内容が空です！");
  const date = new Date().toLocaleDateString();

  const newEntry = { date, text };
  const diaries = JSON.parse(localStorage.getItem("diaries")) || [];
  diaries.push(newEntry);
  localStorage.setItem("diaries", JSON.stringify(diaries));
  diaryInput.value = "";
  loadDiaries();
});

// 初期化
loadDiaries();

