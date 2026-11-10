const FACES = ["hippo", "turtle", "orange", "cucumber", "eggplant", "toothbrush"];

const FACE_DATA = {
  hippo:      { label:"カバ",       power:60, triple:"カバ会議" },
  turtle:     { label:"カメ",       power:50, triple:"甲羅閉店" },
  orange:     { label:"オレンジ",   power:40, triple:"ビタミン過剰" },
  cucumber:   { label:"きゅうり",   power:30, triple:"きゅうり農家" },
  eggplant:   { label:"ナス",       power:20, triple:"ナス大臣" },
  toothbrush: { label:"歯ブラシ",   power:10, triple:"歯みがき週間" }
};

const FACE_ROTATION = {
  hippo:"rotateX(0deg) rotateY(0deg)",
  turtle:"rotateX(0deg) rotateY(180deg)",
  orange:"rotateX(0deg) rotateY(-90deg)",
  cucumber:"rotateX(0deg) rotateY(90deg)",
  eggplant:"rotateX(-90deg) rotateY(0deg)",
  toothbrush:"rotateX(90deg) rotateY(0deg)"
};

const MISS_COMMENTS = [
  "次のひと振りに期待！",
  "サイコロたちは自由です",
  "これはこれで、いい並び",
  "卓上がざわついています"
];

let round = 1;
let score = 0;
let rolling = false;
let finished = false;

const titleScreen = document.getElementById("titleScreen");
const gameScreen = document.getElementById("gameScreen");
const resultScreen = document.getElementById("resultScreen");
const startBtn = document.getElementById("startBtn");
const rollBtn = document.getElementById("rollBtn");
const backTitleBtn = document.getElementById("backTitleBtn");
const retryBtn = document.getElementById("retryBtn");
const shareBtn = document.getElementById("shareBtn");
const homeBtn = document.getElementById("homeBtn");
const roundNum = document.getElementById("roundNum");
const scoreNum = document.getElementById("scoreNum");
const roleName = document.getElementById("roleName");
const roleDetail = document.getElementById("roleDetail");
const pointText = document.getElementById("pointText");
const judgeBox = document.getElementById("judgeBox");
const progress = document.getElementById("progress");
const finalScore = document.getElementById("finalScore");
const resultComment = document.getElementById("resultComment");
const diceSound = document.getElementById("diceSound");
const diceEls = [
  document.getElementById("dice1"),
  document.getElementById("dice2"),
  document.getElementById("dice3")
];

startBtn.addEventListener("click", startGame);
rollBtn.addEventListener("click", handleRollButton);
backTitleBtn.addEventListener("click", goTitle);
retryBtn.addEventListener("click", startGame);
shareBtn.addEventListener("click", shareResult);
homeBtn.addEventListener("click", () => {
  stopDiceSound();
  location.href = "../home/";
});

createProgressDots();

function createProgressDots(){
  progress.innerHTML = "";
  for(let i = 0; i < 10; i++){
    const dot = document.createElement("span");
    dot.className = "progress-dot";
    dot.setAttribute("aria-hidden", "true");
    progress.appendChild(dot);
  }
}

function updateProgress(completed){
  [...progress.children].forEach((dot, index) => {
    dot.classList.toggle("done", index < completed);
  });
  progress.setAttribute("aria-label", `10回中${completed}回終了`);
}

function showScreen(screen){
  [titleScreen, gameScreen, resultScreen].forEach(item => item.classList.remove("active"));
  screen.classList.add("active");
}

function startGame(){
  stopDiceSound();
  round = 1;
  score = 0;
  rolling = false;
  finished = false;

  roundNum.textContent = "1";
  scoreNum.textContent = "0";
  roleName.textContent = "ふってみよう";
  roleDetail.textContent = "全10回の合計点で勝負！";
  pointText.textContent = "0点";
  pointText.classList.remove("gain");
  judgeBox.className = "judge-box";
  rollBtn.disabled = false;
  rollBtn.textContent = "ふる！";
  updateProgress(0);

  setDiceFace(diceEls[0], "hippo");
  setDiceFace(diceEls[1], "turtle");
  setDiceFace(diceEls[2], "orange");
  showScreen(gameScreen);
}

function goTitle(){
  stopDiceSound();
  rolling = false;
  showScreen(titleScreen);
}

function handleRollButton(){
  if(finished){
    showResult();
    return;
  }
  rollDice();
}

function playDiceSound(){
  if(!diceSound) return;
  diceSound.pause();
  diceSound.currentTime = 0;
  diceSound.volume = 0.45;
  const playPromise = diceSound.play();
  if(playPromise) playPromise.catch(() => {});
}

function stopDiceSound(){
  if(!diceSound) return;
  diceSound.pause();
  diceSound.currentTime = 0;
}

function rollDice(){
  if(rolling) return;

  rolling = true;
  rollBtn.disabled = true;
  judgeBox.className = "judge-box";
  pointText.classList.remove("gain");
  roleName.textContent = "コロコロ……";
  roleDetail.textContent = "";
  pointText.textContent = "";
  playDiceSound();

  const result = [randomFace(), randomFace(), randomFace()];
  diceEls.forEach((dice, index) => rollCube(dice, index, result[index]));

  window.setTimeout(() => {
    stopDiceSound();
    const judge = judgeRoll(result);
    score += judge.point;

    roleName.textContent = judge.name;
    roleDetail.textContent = judge.detail;
    pointText.textContent = judge.point > 0 ? `${judge.point}点獲得！` : "0点";
    scoreNum.textContent = String(score);
    judgeBox.classList.add("hit");
    judgeBox.classList.toggle("triple", judge.type === "triple");
    if(judge.point > 0) pointText.classList.add("gain");

    updateProgress(round);

    if(round >= 10){
      finished = true;
      rollBtn.textContent = "結果を見る";
    }else{
      round += 1;
      roundNum.textContent = String(round);
      rollBtn.textContent = "ふる！";
    }

    rolling = false;
    rollBtn.disabled = false;
  }, 1150);
}

function rollCube(dice, index, finalFace){
  dice.style.transition = "none";
  dice.style.transform = `rotateX(${rand(0,360)}deg) rotateY(${rand(0,360)}deg) rotateZ(${rand(0,90)}deg)`;
  void dice.offsetWidth;

  const paths = [
    [
      {x:-22,y:-28,z:38,rx:220,ry:160,rz:-24},
      {x:14,y:8,z:0,rx:430,ry:340,rz:18},
      {x:-8,y:-14,z:28,rx:620,ry:540,rz:-10}
    ],
    [
      {x:10,y:-32,z:44,rx:-240,ry:180,rz:20},
      {x:-16,y:6,z:0,rx:-450,ry:360,rz:-18},
      {x:12,y:-12,z:30,rx:-660,ry:570,rz:12}
    ],
    [
      {x:24,y:-26,z:40,rx:210,ry:-190,rz:24},
      {x:-12,y:10,z:0,rx:420,ry:-380,rz:-16},
      {x:10,y:-10,z:26,rx:640,ry:-600,rz:14}
    ]
  ];

  const path = paths[index];
  window.setTimeout(() => moveCube(dice,path[0],".24s linear"),20);
  window.setTimeout(() => moveCube(dice,path[1],".24s linear"),280);
  window.setTimeout(() => moveCube(dice,path[2],".26s linear"),540);
  window.setTimeout(() => {
    dice.style.transition = "transform .32s cubic-bezier(.15,.8,.25,1)";
    dice.style.transform = `translate3d(0,0,0) ${FACE_ROTATION[finalFace]}`;
    dice.dataset.face = finalFace;
  },840);
}

function moveCube(dice,step,transition){
  dice.style.transition = `transform ${transition}`;
  dice.style.transform = `translate3d(${step.x}px,${step.y}px,${step.z}px) rotateX(${step.rx}deg) rotateY(${step.ry}deg) rotateZ(${step.rz}deg)`;
}

function setDiceFace(dice,face){
  dice.style.transition = "transform .25s ease";
  dice.style.transform = FACE_ROTATION[face];
  dice.dataset.face = face;
}

function randomFace(){
  return FACES[Math.floor(Math.random() * FACES.length)];
}

function rand(min,max){
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function judgeRoll(result){
  const counts = {};
  result.forEach(face => counts[face] = (counts[face] || 0) + 1);
  const unique = Object.keys(counts);

  if(unique.length === 1){
    const face = unique[0];
    return {
      type:"triple",
      name:`${FACE_DATA[face].triple}！`,
      detail:`${FACE_DATA[face].label}のゾロ目`,
      point:FACE_DATA[face].power + 60
    };
  }

  if(unique.length === 2){
    const pairFace = unique.find(face => counts[face] === 2);
    const singleFace = unique.find(face => counts[face] === 1);
    return {
      type:"pair",
      name:`${FACE_DATA[pairFace].label}のペア`,
      detail:`決め手：${FACE_DATA[singleFace].label}`,
      point:FACE_DATA[singleFace].power
    };
  }

  return {
    type:"miss",
    name:"ばらばら",
    detail:MISS_COMMENTS[Math.floor(Math.random() * MISS_COMMENTS.length)],
    point:0
  };
}

function showResult(){
  stopDiceSound();
  finalScore.textContent = String(score);
  resultComment.textContent = getResultComment(score);
  showScreen(resultScreen);
}

function getResultComment(total){
  if(total >= 430) return "これは見事な振りっぷり！";
  if(total >= 230) return "なかなかの勝負でした";
  return "もう一勝負いきますか";
}

function shareResult(){
  const text = `カバチロで勝負！\n合計${score}点でした。\n\n#カバゲーセン #カバチロ`;
  const url = encodeURIComponent(location.href);
  const shareText = encodeURIComponent(text);
  window.open(`https://twitter.com/intent/tweet?text=${shareText}&url=${url}`,"_blank","noopener,noreferrer");
}
