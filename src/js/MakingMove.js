// 0) Запустити таймер при старті ходу (60 сек)
// 1) Клік на карту виділяє її і підсвічує ряд куди можна поставити
// 2) Клік на ряд і ставить карту в ряд якщо вона виділена і можна її туди ставити запускається її аудіо файл
// 2,1) Активуємо її властивість
// 2,2) Перерахувати суму ряда і загальну кількість балів в раунді 
// 2,3) Відобразити результат на екрані
// 2,4) Зупинити таймер і передати хід 

import { updateUserObject, updateUserSingleProperty } from "./server";
import { putOnRow, putOnBoard } from "./dealingCards";
import {moveCardInGraveyard} from "./reset_card";
import { coundRoundScores } from "./countRoundScore";
import * as allAbilities from './abilities';
import PutTheCardOnTheTable from "../audio/Background/PutTheCardOnTheTable.mp3";

import "../sass/MakingMove.scss";
////////
// enum PlayerState {
//   MyTurn,
//   OpponentTurn,
//   EndRound
// }
/////////////

// main controller
class MakingMove{
  constructor (){
// this.state = PlayerState.MyTurn;///////
      // find hand and row
      this.hand = null;
      this.topRow = null;
      this.middleRow = null;
      this.bottomRow = null;
      this.rowForAbilities = null;
      // to output points
      this.topRowSumDiv = null;
      this.middleRowSumDiv = null;
      this.bottomRowSumDiv = null;
      this.totalDiv = null;

      this.opponentTopRowSumDiv = null;
      this.opponentMiddleRowSumDiv = null;
      this.opponentBottomRowSumDiv = null;
      this.opponentTotalDiv = null;

      this.totalUserCards = null;
      this.totalOpponentCards = null;

      this.coinSide = null;
      this.passBtn = null;
      //audio
      this.soundPutTheCardOnTheTable = new Audio();
      this.soundPutTheCardOnTheTable.src = PutTheCardOnTheTable;
      // timer
      this.countdownTimer = null;
      this.nameOfSelectedCard = null;
      this.selectedCard = null;
      this.selectedCardDiv = null;
      this.userObj = null;
      this.opponentObj = null;
      // bind
      this.start = this.start.bind(this);
      this.handlerClickCard = this.handlerClickCard.bind(this);
      this.handlerClickRow = this.handlerClickRow.bind(this);
      this.activeAbility = this.activeAbility.bind(this);
      this.calculateTotalNumberOfPoints = this.calculateTotalNumberOfPoints.bind(this);
      this.displayResult = this.displayResult.bind(this);
      this.nextTurn = this.nextTurn.bind(this);
      this.drawingOfOpponentStep = this.drawingOfOpponentStep.bind(this);
      this.handlerOnPassBtn = this.handlerOnPassBtn.bind(this);
    }
    
    
    start(usersObj){ 
      this.hand = document.querySelector("#player-hand");
      this.topRow = document.querySelector("#player-topRow");
      this.middleRow = document.querySelector("#player-middleRow");
      this.bottomRow = document.querySelector("#player-bottomRow");
      this.rowForAbilities = null;
      // to output points
      this.topRowSumDiv = document.querySelector("#player-topRow").previousElementSibling;
      this.middleRowSumDiv = document.querySelector("#player-middleRow").previousElementSibling;
      this.bottomRowSumDiv = document.querySelector("#player-bottomRow").previousElementSibling;
      this.totalDiv = document.querySelector(".battlefield__bottom .battlefield__current-score");

      this.opponentTopRowSumDiv = document.querySelector("#opponent-topRow").previousElementSibling;
      this.opponentMiddleRowSumDiv = document.querySelector("#opponent-middleRow").previousElementSibling;
      this.opponentBottomRowSumDiv = document.querySelector("#opponent-bottomRow").previousElementSibling;
      this.opponentTotalDiv = document.querySelector(".battlefield__top .battlefield__current-score");

      this.totalUserCards = document.querySelector('.battlefield__bottom .remaining-cards__number');
      this.totalOpponentCards = document.querySelector('.battlefield__top .remaining-cards__number');

      this.coinSide = document.querySelector('#coin');
      this.passBtn = document.querySelector('.btn-pass');

      // timer
      this.countdownTimer = new CountdownTimer(document.querySelector(".left__timer"));
      // 0) Запустити таймер при старті ходу (60 сек)
      this.userObj = usersObj.user;
      this.opponentObj = usersObj.opponent;
//////////////
// switch (this.state) {
//   case PlayerState.MyTurn: {
    
//     break;
//   }
//   case PlayerState.OpponentTurn: {
//     break;
//   }
//   case PlayerState.EndRound: {
//     break;
//   }
// }
////////////////////
      if (this.userObj.endRound && this.opponentObj.endRound) {
        console.log('END OF ROUND IF');
        updateUserSingleProperty('myTurn', false, 0);
        updateUserSingleProperty('myTurn', false, 1);
        // updateUserSingleProperty('endRound', false, 0);
        // updateUserSingleProperty('endRound', false, 1);
        coundRoundScores(this.userObj, this.opponentObj, this.drawingOfOpponentStep, this.displayResult);
        return;
      }
      
      if(this.userObj.myTurn === false) return;
      
      // console.log('this.opponentObj in start', this.opponentObj);
      
      this.drawingOfOpponentStep();

      this.displayResult();

      if (this.userObj.endRound) {
        this.nextTurn();
        return;
      }

      this.countdownTimer.startCountdownTimer(60, this.userObj, this.nextTurn);
      this.hand.addEventListener("click", this.handlerClickCard);
      this.passBtn.addEventListener('click', this.handlerOnPassBtn);
  }

  drawingOfOpponentStep(){
    this.opponentTopRowSumDiv.textContent = this.opponentObj.topRowSum;
    this.opponentMiddleRowSumDiv.textContent = this.opponentObj.middleRowSum;
    this.opponentBottomRowSumDiv.textContent = this.opponentObj.bottomRowSum;
    this.opponentTotalDiv.textContent = this.opponentObj.total;
    
    if (this.opponentObj.topRow){
      putOnRow(this.opponentObj.topRow, "#opponent-topRow")
    }
    if (this.opponentObj.middleRow){
      putOnRow(this.opponentObj.middleRow, "#opponent-middleRow")
    }
    if (this.opponentObj.bottomRow){
      putOnRow(this.opponentObj.bottomRow, "#opponent-bottomRow")
    }
    putOnBoard(this.opponentObj.faction, this.opponentObj.cardHand, "#opponent-hand");
   this.totalOpponentCards.textContent =  this.opponentObj.cardHand ? this.opponentObj.cardHand.length : 0;

    
      if(this.userObj.name === "Player 1") {
          this.coinSide.classList.remove('player2');
          this.coinSide.classList.remove('coin-player2');
          this.coinSide.classList.add('coin-player1'); 
      } 
      else {
          this.coinSide.classList.remove('player1');
          this.coinSide.classList.remove('coin-player1');
          this.coinSide.classList.add('coin-player2');
      }
   
  }
  // 1) Клік на карту виділяє її і підсвічує ряд куди можна поставити
  handlerClickCard({target}){
    if(target.nodeName !== "IMG") {
      return;
    }
    //Очистка попереднього кліка
    Array.from(this.hand.querySelectorAll(".active-card")).map(el => {el.classList.remove("active-card")});
    this.topRow.classList.remove("active-row");
    this.middleRow.classList.remove("active-row");
    this.bottomRow.classList.remove("active-row");

    //remove listeners if card was not put on board
    this.topRow.removeEventListener("click", this.handlerClickRow);
    this.middleRow.removeEventListener("click", this.handlerClickRow);
    this.bottomRow.removeEventListener("click", this.handlerClickRow);

    //Очистка попереднього кліка
    this.selectedCardDiv = target;
    this.selectedCardDiv.classList.add("active-card"); 
    this.nameOfSelectedCard = target.getAttribute("data-name");
    this.selectedCard = this.userObj.cardHand.find(el=>{
      return el.name==this.nameOfSelectedCard;
    });
    // this.topRow.classList.remove("active-row");
    if (this.selectedCard.positions.includes("Melee")){
      this.topRow.addEventListener("click", this.handlerClickRow);
      this.topRow.classList.add("active-row");
    }
    // this.middleRow.classList.remove("active-row");
    if (this.selectedCard.positions.includes("Ranged")){
      this.middleRow.addEventListener("click", this.handlerClickRow);
      this.middleRow.classList.add("active-row");
    }
    // this.bottomRow.classList.remove("active-row");
    if (this.selectedCard.positions.includes("Siege")){
      this.bottomRow.addEventListener("click", this.handlerClickRow);
      this.bottomRow.classList.add("active-row");
    }

  }
  // 2) Клік на ряд і ставить карту в ряд якщо вона виділена і можна її туди ставити запускається її аудіо файл
  handlerClickRow({target}){
    if(!target.classList.contains("rows__row")) return;
    this.userObj.topRow = this.userObj.topRow ? this.userObj.topRow :  [];
    this.userObj.middleRow = this.userObj.middleRow ? this.userObj.middleRow : [];
    this.userObj.bottomRow = this.userObj.bottomRow ? this.userObj.bottomRow : [];
    this.rowForAbilities = target.id;

    switch(target.id){
      case "player-topRow":
      this.userObj.topRow.push(this.selectedCard);
      break;
      case "player-middleRow":
      this.userObj.middleRow.push(this.selectedCard);
      break;
      case "player-bottomRow":
      this.userObj.bottomRow.push(this.selectedCard);
      break;
    }
    
    // this.userObj.cardHand = this.userObj.cardHand.filter(el=>el.name !== this.nameOfSelectedCard);
    const activeCardIndex = [...this.hand.querySelectorAll("img")].indexOf(this.selectedCardDiv)
    
    // const index = this.userObj.cardHand.indexOf(this.nameOfSelectedCard);
    this.userObj.cardHand.splice(activeCardIndex,1);
    this.topRow.classList.remove("active-row");
    this.middleRow.classList.remove("active-row");
    this.bottomRow.classList.remove("active-row");
    this.selectedCardDiv.classList.remove("active-card");
    target.append(this.selectedCardDiv.parentElement);
    //start audio of the selected card
    this.soundPutTheCardOnTheTable.play();
    // 2,1) Активуємо її властивість
    this.activeAbility(target)

    // 2,2) Перерахувати суму ряда і загальну кількість балів в раунді 
    this.calculateTotalNumberOfPoints()
    // 2,3) Відобразити результат на екрані
    this.displayResult()
    // 2,4) Зупинити таймер і передати хід 
    // console.log("cardHand before last pass", this.userObj.cardHand , !this.userObj.cardHand.length);
    !this.userObj.cardHand.length? this.handlerOnPassBtn() : this.nextTurn();
  }
  // 2,1) Активуємо її властивість
  activeAbility(target){
  let reg = /[ \w-]+?(?=\.)/gi;
  let objParamForAbiliti = {
    userObj: this.userObj,
    selectedCard: this.selectedCard,
    rowForAbilities: this.rowForAbilities,
    opponentObj: this.opponentObj,
    drawingOfOpponentStep: this.drawingOfOpponentStep,
    displayResult: this.displayResult,
    calculateTotalNumberOfPoints: this.calculateTotalNumberOfPoints,
    targetRow: this.rowForAbilities, ///
  }
  let nameOfFunction = this.selectedCard.img.match(reg)[0];
  allAbilities[nameOfFunction](objParamForAbiliti);
  }
  // 2,2) Перерахувати суму ряда і загальну кількість балів в раунді 
  calculateTotalNumberOfPoints(){
    this.userObj.topRowSum = this.userObj.topRow.reduce((acc, el)=> acc + el.strength, 0);
    this.userObj.middleRowSum = this.userObj.middleRow.reduce((acc, el)=> acc + el.strength, 0);
    this.userObj.bottomRowSum = this.userObj.bottomRow.reduce((acc, el)=> acc + el.strength, 0);
    this.userObj.total = this.userObj.topRowSum + this.userObj.middleRowSum + this.userObj.bottomRowSum;

    // this.opponentObj.topRowSum = this.opponentObj.topRow.reduce((acc, el)=> acc + el.strength, 0);
    // this.opponentObj.middleRowSum = this.opponentObj.middleRow.reduce((acc, el)=> acc + el.strength, 0);
    // this.opponentObj.bottomRowSum = this.opponentObj.bottomRow.reduce((acc, el)=> acc + el.strength, 0);
    // this.opponentObj.total = this.opponentObj.topRowSum + this.opponentObj.middleRowSum + this.opponentObj.bottomRowSum;
  }
  // 2,3) Відобразити результат на екрані
  displayResult(){
    this.topRowSumDiv.textContent = this.userObj.topRowSum;
    this.middleRowSumDiv.textContent = this.userObj.middleRowSum;
    this.bottomRowSumDiv.textContent = this.userObj.bottomRowSum;
    this.totalDiv.textContent = this.userObj.total;
    this.totalUserCards.textContent = this.userObj.cardHand.length; // display count cards
  }
  // 2,4) Зупинити таймер і передати хід 
  nextTurn(){
    this.userObj.myTurn = false;
    this.countdownTimer.resetTimer ();
    this.nameOfSelectedCard = null;
    this.selectedCard = null;
    this.selectedCardDiv = null;
    this.topRow.removeEventListener("click", this.handlerClickRow);
    this.middleRow.removeEventListener("click", this.handlerClickRow);
    this.bottomRow.removeEventListener("click", this.handlerClickRow);
    this.passBtn.removeEventListener('click', this.handlerOnPassBtn);
    this.hand.removeEventListener("click", this.handlerClickCard);
    
    const userIdx = JSON.parse(localStorage.getItem('index'));
    let opponentIdx = userIdx ? 0 : 1;
    updateUserObject(this.userObj, userIdx)
      .then(() => updateUserSingleProperty('myTurn', true, opponentIdx));
    
    
    // flip coin 
    if(this.userObj.name === "Player 1") {
      this.coinSide.classList.remove('player1');
      this.coinSide.classList.remove('coin-player1');
      this.coinSide.classList.add('coin-player2');
    } else {
      this.coinSide.classList.remove('player2');
      this.coinSide.classList.remove('coin-player2');
      this.coinSide.classList.add('coin-player1');
    }
  }

  // // 2,5) По кліку на кнопку Pass
  // handlerOnPassBtn() {
  //   // if (!this.userObj.endRound && !this.opponentObj.endRound) {};
  //   // console.log("Last Pass")
  //   this.userObj.endRound = true;
  //   updateUserSingleProperty('endRound', true, JSON.parse(localStorage.getItem('index')));
  //   this.nextTurn();
  // }


  // 2,5) По кліку на кнопку Pass
  handlerOnPassBtn() {
    if (this.userObj.endRound && this.opponentObj.endRound){

    // if (!this.userObj.endRound && !this.opponentObj.endRound) {};
    // console.log("Last Pass")
    this.userObj.endRound = true;
    // updateUserSingleProperty('endRound', true, JSON.parse(localStorage.getItem('index')));
    this.userObj.myTurn = false;
    this.countdownTimer.resetTimer ();
    this.nameOfSelectedCard = null;
    this.selectedCard = null;
    this.selectedCardDiv = null;
    this.topRow.removeEventListener("click", this.handlerClickRow);
    this.middleRow.removeEventListener("click", this.handlerClickRow);
    this.bottomRow.removeEventListener("click", this.handlerClickRow);
    this.passBtn.removeEventListener('click', this.handlerOnPassBtn);
    this.hand.removeEventListener("click", this.handlerClickCard);
    
    const userIdx = JSON.parse(localStorage.getItem('index'));
    let opponentIdx = userIdx ? 0 : 1;
    updateUserObject(this.userObj, userIdx)
      // .then(() => updateUserSingleProperty('myTurn', true, opponentIdx));
    
    
    // flip coin 
      if(this.userObj.name === "Player 1") {
        this.coinSide.classList.remove('player1');
        this.coinSide.classList.remove('coin-player1');
        this.coinSide.classList.add('coin-player2');
      } else {
        this.coinSide.classList.remove('player2');
        this.coinSide.classList.remove('coin-player2');
        this.coinSide.classList.add('coin-player1');
      }
    } else {
    this.userObj.endRound = true;
    updateUserSingleProperty('endRound', true, JSON.parse(localStorage.getItem('index')));
    this.nextTurn();
  }
  }
}

class CountdownTimer{
    constructor(parent){
      this.endOfTimer = false;
      this.stopTime = null;
      this.id = null;
      // this.root = document.createElement("div");
      // this.root.classList.add("root");
      // parent.append(this.root);
      parent.innerHTML = `<div class="Countdown-timer">
      <p class="time js-time">60</p>
  </div>`;
      this.time = parent.querySelector(".js-time");
      this.startCountdownTimer = this.startCountdownTimer.bind(this);
      this.callback = this.callback.bind(this);
      this.updateTime = this.updateTime.bind(this);
      this.getFormattedTime = this.getFormattedTime.bind(this);
    }
    /*
    *Запускает таймер обратного отсчета, который считает время 
    *с текущего момента времени и до конца заданного интервала, обновляя содержимое элемента p.js-time 
    *новым значение времени в формате xx:xx.x (минуты:секунды.сотни_миллисекунд).
    */
    startCountdownTimer (CountdownTime,userObj,nextTurn){
      this.stopTime = Date.now() + (CountdownTime*1000);
      this.id = setInterval(()=> this.callback(userObj,nextTurn), 1000);
    }
    /*
    *Callback для setInterval Расчитывает текущее состояние таймера
    *и запускает метод обновления значений на экране
    */
    callback (userObj,nextTurn){
      let timeNow = Date.now();
      this.deltaTime = this.stopTime - timeNow;
      // 3)Якщо меньше 10 сек таймер міняє колір і звук
      if (Math.ceil(this.deltaTime/1000) == 10) {
          this.time.style.color = "#ff0000";
      }      
      if (this.deltaTime <= 0) {
        // console.log('User',userObj);
        this.resetTimer();
        userObj =  moveCardInGraveyard(userObj);
        nextTurn()

      }
      this.updateTime(this.time, this.deltaTime);

    }
    /*
    *Полностью сбрасывает работу таймера
    */
    resetTimer (){
      clearInterval(this.id);
      this.id = null;   
      this.stopTime = null;
      this.deltaTime = 0;
      this.updateTime(this.time, 0);

    }
    /*
    * Обновляет поле счетчика новым значением при вызове
    * аргумент time это кол-во миллисекунд
    */
    updateTime(elem, time) {
      elem.textContent = this.getFormattedTime(time);
    }
    /*
    * Форматирует время выводимое на экран
    */
    getFormattedTime(time) {
      let seconds = Math.floor(time / 1000 % 60);
      seconds = seconds>=10 ? seconds : "0" + seconds;
      return (seconds);
    }
  }

  export {
    MakingMove,
    CountdownTimer,
  };