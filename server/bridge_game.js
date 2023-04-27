
const {
    viewer_endGame,
    // viewer_updateTimeLimit,
    // viewer_updateWinTimes,
    viewer_updateBoard,
    viewer_changeName,
} = require("./protocolTemplate.js");
const { Timer } = require("./timer.js");
const { resolve } = require("path");

const READY = 0;
const RESET = 1;
const DEAL = 2;
const CALL = 3;
const CALL_RESULT = 4;
const CHANGE_FIRST = 5;
const CHANGE_SECOND = 6;
const CHANGE_RESULT = 7;
const PLAY_CARD_FIRST = 8;
const PLAY_CARD_SECOND = 9;
const PLAY_CARD_RESULT = 10;
const GAME_OVER = 11;
const CHANGE_FINAL = 12;
const TEST = 13;
const PHASE_AND_PLAYER_STATUS = 14;

class game{
    static CANCEL_OUT_OF_TIME = 0;
    static CANCEL_RESTART_GAME = 1;
    static CANCEL_ASSIGN_WINNER = 2;
    constructor(
        game_id, 
        p1, 
        p2,
        time_limit,
        push_hist,
        viewers,
        update_scoreboard,
        add_reconnect_promise,
        game_num
    ){
        this.game_id = game_id;
        this.p1 = p1;
        this.p2 = p2;
        this.time_limit = time_limit;
        this.pilecards = [];
        this.trump = undefined;

        this.save_p1_cards = [];
        this.save_p2_cards = [];
        this.save_pilecards = [];
        this.p1_cards = [];
        this.p2_cards = [];
        this.p1_score = 0;
        this.p2_score = 0;
        this.P1 = true;
        this.P2 = false;
        this.is_end = false;
        this.record = []; // 紀錄(object)
        this.hist = ""; // 紀錄
        this.push_hist = push_hist;
        this.viewers = viewers;
        this.update_scoreboard = update_scoreboard;
        this.add_reconnect_promise = add_reconnect_promise;
        this.cancel_request = undefined;
        this.game_num = game_num;
        this.p1_win = 0;
        this.p2_win = 0;

        this.early_win = undefined; // 有人先贏了
        this.old_call = undefined;
        this.dealer = undefined; // 莊家
        this.dealer_name = undefined;
        this.dealer_win_condition = undefined; //莊家需要贏的墩數

        this.current_player = undefined; // 換牌先手

        this.to_change = undefined; // 一回合中先翻起來的牌(需要搶的)
        
        this.first_play = undefined; // 打牌先手
        this.assign_winner = undefined; // 指定贏家
        
    }

    visual_trump = () => {
        let shape = ['黑桃', '紅心', '方塊', '梅花', '無王'];
        // console.log("王牌為:", shape[this.trump]);
        this.hist += "王牌為:" + shape[this.trump] + "\n";
    }

    visual_handcards = () => {
        let number_list = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
        let shape = ['黑桃', '紅心', '方塊', '梅花'];
        let shape_list = [[[], [], [], []], [[], [], [], []]];
        let count = 0;
        for(let i = 0; i < this.p1_cards.length; i++){
            for(let j = 0; j < 4; j++){
                if(Math.floor(this.p1_cards[i] / 13) === j){
                    // console.log(Math.floor(p1_cards[i] / 13));
                    shape_list[count][j].push(number_list[this.p1_cards[i] % 13]);
                    break;
                }
            }
        }
        count++;
        for(let i = 0; i < this.p2_cards.length; i++){
            for(let j = 0; j < 4; j++){
                if(Math.floor(this.p2_cards[i] / 13) === j){
                    // console.log(Math.floor(p1_cards[i] / 13));
                    shape_list[count][j].push(number_list[this.p2_cards[i] % 13]);
                    break;
                }
            }
        }
        for(let j = 0; j < shape_list.length; j++){
            if(j === 0){
                // console.log(this.p1.name + ":");
                this.hist += this.p1.name + ":\n";
            }
            else{
                // console.log(this.p2.name + ":");
                this.hist += this.p2.name + ":\n";
            }
            for(let i = 0; i < 4; i++){
                // if(shape_list[j][i].length !== 0)
                // console.log(shape[i] + ":" + shape_list[j][i]);
                this.hist += shape[i] + ":" + shape_list[j][i] + "\n";
            }
        }
    }

    visual_card = (card) => {
        let number_list = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
        let shape = ['黑桃', '紅心', '方塊', '梅花'];
        return shape[Math.floor(card / 13)] + number_list[card % 13];
    
    }

    create_randomcards = async() => {
        for(let i = 0; i < 52; i++){
            this.pilecards.push(i)
        }
        this.pilecards.sort(() => {
            return(0.5 - Math.random());
        })
    }

    outcard = () => {
        return [this.save_pilecards, this.save_p1_cards, this.save_p2_cards];
    }

    loadcard = (cardlist) => {
        this.save_pilecards = cardlist[0];
        this.save_p1_cards = cardlist[1];
        this.save_p2_cards = cardlist[2];
    }

    sortcard = (arr) => {
        return arr.sort((a, b) => {
            return a - b;
        });
    }

    reset = async(mode = 1) => {
        this.dealer_win_condition = undefined;
        this.p1_score = 0;
        this.p2_score = 0;
        if(mode === 1){
            this.create_randomcards() // 建立新的隨機牌堆
            // 發牌
            for(let i = 0; i < 13; i++){
                this.p1_cards.push(this.pilecards.pop());
                this.p2_cards.push(this.pilecards.pop());
            }
            this.p1_cards = this.sortcard(this.p1_cards);
            this.p2_cards = this.sortcard(this.p2_cards);
            this.save_pilecards = Array.from(this.pilecards);
            this.save_p1_cards = Array.from(this.p1_cards);
            this.save_p2_cards = Array.from(this.p2_cards);
        }
        else{
            this.pilecards = Array.from(this.save_pilecards);
            this.p1_cards = Array.from(this.save_p1_cards);
            this.p2_cards = Array.from(this.save_p2_cards);
        }
        // console.log(this.pilecards);
        // console.log(this.p1_cards);
        // console.log(this.p2_cards);
        this.p1_timer = new Timer(this.time_limit, (t) => {});
        this.p2_timer = new Timer(this.time_limit, (t) => {});
        Object.values(this.viewers).forEach((viewer) => {
            viewer.send(
                viewer_changeName(this.game_id, this.p1.name, this.p2.name)
            );
            // viewer.send(
            //     viewer_updateTimeLimit(
            //         this.game_id,
            //         Math.ceil(this.p1_timer.getMinute()),
            //         Math.ceil(this.p2_timer.getMinute())
            //     )
            // );
            // viewer.send(
            //     viewer_updateWinTimes(
            //         this.game_id,
            //         this.p1_score,
            //         this.p2_current_playerscore
            //     )
            // );
        });

    } 
    
    // player_request_data = (step_id, data) => {
    //     return JSON.stringify({
    //         action: "request_data",
    //         data: {
    //             id: step_id,
    //             data: data
    //         }
    //     });
    // };


    viewer_update = () => {
        Object.values(this.viewers).forEach((viewer) => {
            let data = viewer_updateBoard(this.game_id, this.record)
            viewer.send(data);
        });
    }


    getdata = async(player, id, in_data = null) => {
        let socket = player.socket;
        let request_resolve, request_reject;
        let cancel_request_promise;
        let tag = "#斷線";
        let timer = this.current_player === this.P1 ? this.p1_timer : this.p2_timer;
        let p = new Promise(async(resole, reject) => {
            request_resolve = resole;
            request_reject = reject;
        });
        cancel_request_promise = (cancel_id) => {
            request_reject(cancel_id);
        };
        let disconnect_pack = async() => {
            timer.release(); // 時間暫停
            let timeout = setTimeout(() => {
                console.log("斷線");
                timer.hold(request_reject); // 重連失敗
                request_reject("斷線");
            }, 1000 * 60);
            // console.log("重連0000000");
            if (player === this.p1) {
                this.early_win = this.P2;
                // console.log(this.p1.name)
                // this.hist[this.hist.length - 1].black.name = this.black.name + tag;
                Object.values(this.viewers).forEach((viewer) => {
                    viewer.send(
                        viewer_changeName(
                            this.game_id,
                            this.p1.name + tag,
                            this.p2.name
                        )
                    );
                });
            } else {
                this.early_win = this.P1;
                // console.log(this.p2.name)
                // this.hist[this.hist.length - 1].white.name = this.white.name + tag;
                Object.values(this.viewers).forEach((viewer) => {
                    viewer.send(
                        viewer_changeName(
                            this.game_id,
                            this.p1.name,
                            this.p2.name + tag
                        )
                    );
                });
            }
            socket = await this.add_reconnect_promise(player.name);
            console.log("重連成功");
            clearTimeout(timeout);
            // this.timer.release();
            // tag = "#斷線";
            Object.values(this.viewers).forEach((viewer) => {
                viewer.send(
                    viewer_changeName(this.game_id, this.p1.name, this.p2.name)
                );
            });
        };

        let handler = (message) => {
            try {
                // socket.removeEventListener("message", handler);
                let get_data = JSON.parse(message.data);
                console.log(get_data)
                switch(get_data.id){
                    case 0 : // ready
                        break;
                    case 2 : // deal
                        break;
                    case 3 : // call
                        socket.removeEventListener("message", handler);
                        request_resolve(get_data.player_call);
                        break;
                    case 4 : // call_result
                        break;
                    case 5 : // change_first
                        socket.removeEventListener("message", handler);
                        request_resolve(get_data.player_card_for_change);
                        break;
                    case 6 : // change_second
                        socket.removeEventListener("message", handler);
                        request_resolve(get_data.player_card_for_change);
                        break;
                    case 7 : // change_result
                        break;
                    case 8 : // play_card_first
                        socket.removeEventListener("message", handler);
                        request_resolve(get_data.player_play);
                        break;
                    case 9 : // play_card_second
                        socket.removeEventListener("message", handler);
                        request_resolve(get_data.player_play);
                        break;
                    case 10 : // play_card_result
                        break;
                    case 11: // game_over
                        // console.log("game_over");
                        break;
                    case 12: // change_finall
                        break;
                    case 13: // test
                        break;
                    case 14: // check status
                        break;
                    default:
                        break;
                }
                socket.removeEventListener("message", handler);
                socket.removeEventListener("close", handler_close);
                request_resolve();
                // socket.removeEventListener("close", handler_close)
            } catch (e) {
                console.log("game:getMove", "invalid protocol format");
                socket.close();
            }
        };

        let handler_close = async() => {
            // socket.removeEventListener("message", handler);
            socket.removeEventListener("close", handler_close);
            timer.release();
            await disconnect_pack()
            init_pack();
        };

        let player_request = (id, in_data) => {
            let data_send = undefined;
            switch(id){
                case READY :
                    data_send = {
                        id: id
                    };
                    break;
                case RESET :
                    data_send = {
                        id: id
                    };
                    break;
                case DEAL : // deal
                    data_send = {
                        id: id,
                        data: {
                            hand_card: in_data
                        }
                    };
                    break;
                case CALL : // call
                    data_send = {
                        id: id,
                        data: {
                            call: in_data
                        }
                    };
                    break;
                case CALL_RESULT : // call_result
                    data_send = {
                        id: id,
                        data: {
                            result: in_data
                        }
                    };
                    break;
                case CHANGE_FIRST : // change_first
                    data_send = {
                        id: id,
                        data: {
                            change_card: in_data
                        }
                    };
                    break;
                case CHANGE_SECOND : // change_second
                    data_send = {
                        id: id,
                        data: {
                            change_card: in_data[0],
                            opp_card: in_data[1]
                        }
                    };
                    break;
                case CHANGE_RESULT : // change_result
                    data_send = {
                        id: id,
                        data: {
                            opp_card: in_data[0],
                            player_get: in_data[1]
                        }
                    };
                    break;
                case PLAY_CARD_FIRST : // play_card_first
                    data_send = {
                        id: id,
                    };
                    break;
                case PLAY_CARD_SECOND : // play_card_second
                    data_send = {
                        id: id,
                        data: {
                            opp_play: in_data
                        }
                    };
                    break;
                case PLAY_CARD_RESULT : // play_card_result
                    data_send = {
                        id: id,
                        data: {
                            opp_card: in_data[0],
                            result: in_data[1]
                        }
                    };
                    break;
                case GAME_OVER: // game_over
                    data_send = {
                        id: id,
                    };
                    break;
                case CHANGE_FINAL: // change_finall
                    data_send = {
                        id: id
                    };
                    break;
                case TEST: // test
                    data_send = {
                        id: id
                    };
                    break;
                case PHASE_AND_PLAYER_STATUS: // 傳送目前階段及先後手
                    data_send = {
                        id: id,
                        state: in_data[0],
                        turn: in_data[1]
                    };
                    break;
                default:
                    break;
            }
            return JSON.stringify(data_send);
        }

        let init_pack = () => {
            socket.addEventListener("message", handler);
            socket.addEventListener("close", handler_close);
            socket.send(
                player_request(id, in_data)
            );
            timer.hold(request_reject);
        };

        if (socket.readyState === 3) {
            console.log('socket.readyState 3');
            await disconnect_pack()
        }
        init_pack();
        this.cancel_request = cancel_request_promise;
        return p;
    };

    judge_call = (call, player_number) => {
        if(call === 0){
            this.dealer = !player_number;
            this.current_player = !player_number;
            this.first_play = player_number;
            this.trump = (this.old_call % 5) * (-1) + 4
            this.dealer_win_condition = Math.floor((this.old_call - 1) / 5) + 7;
            if(this.dealer){
                // console.log(this.p1.name + "為莊家");
                this.dealer_name = this.p1.name;
                this.hist += this.p1.name + "為莊家\n";
            }else{
                // console.log(this.p2.name + "為莊家");
                this.dealer_name = this.p2.name;
                this.hist += this.p2.name + "為莊家\n";
            }
            // console.log("需要贏下" + this.dealer_win_condition + "墩");
            this.hist += "需要贏下" + this.dealer_win_condition + "墩\n";
        }
    }

    call_card = async() => {
        let change = true;
        await this.getdata(this.p1, 14, ["call", "1"])
        await this.getdata(this.p2, 14, ["call", "0"])
        let call = await this.getdata(this.p1, 3, 0); // p1 先喊
        this.old_call = call;
        // console.log(this.p1.name + "先手喊牌:" + call);
        this.hist += this.p1.name + "先手喊牌:" + call + "\n";
        // resolve();
        while(call !== 0){
            if(change){
                call = await this.getdata(this.p2, 3, call);
                // console.log(this.p2.name + "喊牌:" + call);
                this.hist += this.p2.name + "喊牌:" + call + "\n";
                this.judge_call(call, false);
            }
            else{
                call = await this.getdata(this.p1, 3, call);
                // console.log(this.p1.name + "喊牌:" + call);
                this.hist += this.p1.name + "喊牌:" + call + "\n";
                this.judge_call(call, true);
            }
            change = !change;
            if(call !== 0)
                this.old_call = call;
        }
    }

    cmp = (offensive, defensive) => {
        if(Math.floor(defensive / 13) === Math.floor(offensive / 13)){
            if(offensive > defensive)
                return 1;
            else if(offensive < defensive)
                return 0;
            else
                throw new Error("There are two same cards");
        }
        else{
            if(Math.floor(defensive / 13) === this.trump)
                return 0;
            else
                return 1;
        }
    }
    
    // change_card = async(first_player, first_handcards, second_player, second_handcards) => {
    //     this.to_change = this.pilecards.pop();
    //     // console.log("翻開的牌:" + this.visual_card(this.to_change));
    //     this.hist += "翻開的牌:" + this.visual_card(this.to_change) + "\n";
    //     let first_throw_card =  await this.getdata(first_player, 5, this.to_change);
    //     // console.log(first_player.name + "出:" + this.visual_card(first_throw_card));
    //     this.hist += first_player.name + "出:" + this.visual_card(first_throw_card) + "\n";
    //     let second_throw_card =  await this.getdata(second_player, 6, [this.to_change, first_throw_card]);
    //     // console.log(second_player.name + "出:" + this.visual_card(second_throw_card));
    //     this.hist += second_player.name + "出:" + this.visual_card(second_throw_card) + "\n";
    //     // 移除用過的牌
    //     first_handcards.splice(first_handcards.indexOf(first_throw_card), 1); 
    //     second_handcards.splice(second_handcards.indexOf(second_throw_card), 1);
    //     // 加牌
    //     // 第二張翻起來的牌
    //     let for_lose_card = this.pilecards.pop();
    //     if(this.cmp(first_throw_card, second_throw_card)){
    //         first_handcards.push(this.to_change);
    //         second_handcards.push(for_lose_card);
    //         await this.getdata(first_player, 7, [second_throw_card, this.to_change]);
    //         await this.getdata(second_player, 7, [first_throw_card, for_lose_card]);
    //         // console.log(first_player.name + "拿到:" + this.visual_card(this.to_change));
    //         this.hist += first_player.name + "拿到:" + this.visual_card(this.to_change) + "\n";
    //         // console.log(second_player.name + "拿到:" + this.visual_card(for_lose_card));
    //         this.hist += second_player.name + "拿到:" + this.visual_card(for_lose_card) + "\n";
    //     }
    //     else{
    //         second_handcards.push(this.to_change);
    //         first_handcards.push(for_lose_card);
    //         this.current_player = !this.current_player;
    //         await this.getdata(first_player, 7, [second_throw_card, for_lose_card]);
    //         await this.getdata(second_player, 7, [first_throw_card, this.to_change]);
    //         // console.log(first_player.name + "拿到:" + this.visual_card(for_lose_card));
    //         this.hist += first_player.name + "拿到:" + this.visual_card(for_lose_card) + "\n";
    //         // console.log(second_player.name + "拿到:" + this.visual_card(this.to_change));
    //         this.hist += second_player.name + "拿到:" + this.visual_card(this.to_change) + "\n";
    //     }
    // }

    // play_card = async(first_player, first_handcards, second_player, second_handcards) => {
    //     let first_throw_card =  await this.getdata(first_player, 8);
    //     // console.log(first_player.name + "出:" + this.visual_card(first_throw_card));。。
    //     this.hist += first_player.name + "出:" + this.visual_card(first_throw_card) + "\n";
    //     let second_throw_card =  await this.getdata(second_player, 9, first_throw_card);
    //     // console.log(second_player.name + "出:" + this.visual_card(second_throw_card));
    //     this.hist += second_player.name + "出:" + this.visual_card(second_throw_card) + "\n";
    //     // 移除用過的牌
    //     first_handcards.splice(first_handcards.indexOf(first_throw_card), 1); 
    //     second_handcards.splice(second_handcards.indexOf(second_throw_card), 1);
    //     // 判斷輸贏(算分)
    //     let first_score;
    //     let second_score;
    //     if(!this.cmp(first_throw_card, second_throw_card)){
    //         this.current_player = !this.current_player;
    //         first_score = 0;
    //         second_score = 1;
    //     }else{
    //         first_score = 1;
    //         second_score = 0;
    //     }
    //     if(this.current_player)
    //         this.p1_score += 1;
    //     else
    //         this.p2_score += 1;
    //     await this.getdata(first_player, 10, [second_throw_card, first_score]);
    //     await this.getdata(second_player, 10, [first_throw_card, second_score]);
    // }

    isEndGame = () => {
        // 判斷輸贏
        if(this.dealer){
            // 若是p1為莊家
            if(this.p1_score >= this.dealer_win_condition)
                return this.P1;
            else
                return this.P2;
        }
        else{
            // 若是p2為莊家
            if(this.p2_score >= this.dealer_win_condition)
                return this.P2;
            else
                return this.P1;
        }
    }

    // assignwinner = (player) =>{
    //     this.assign_winner = player;
    //     this.eventEmitter.emit('stop');
    //     console.log('assignwinner');
    // }


    play = async(mode) => {
        await this.reset(mode);
        let result;
        this.record = {
            player: {
                p1: this.p1.name,
                p2: this.p2.name
            },
            hand_card: {},
            call: [],
            change: [],
            play: []
        }
        try{
            // ready
            try {
                await this.getdata(this.p1, 0);
            } catch (e) {
                throw new Error(e);
            }
            try {
                await this.getdata(this.p2, 0);
            } catch (e) {
                throw new Error(e);
            }
            // reset
            try {
                await this.getdata(this.p1, 1);
            } catch (e) {
                throw new Error(e);
            }
            try {
                await this.getdata(this.p2, 1);
            } catch (e) {
                throw new Error(e);
            }
            // return handcards
            try {
                await this.getdata(this.p1, 2, this.p1_cards);
            } catch (e) {
                throw new Error(e);
            }
            try {
                await this.getdata(this.p2, 2, this.p2_cards);
            } catch (e) {
                throw new Error(e);
            }
            // 紀錄換牌前手牌
            this.record.hand_card.p1_call_handcards = Array.from(this.p1_cards);
            this.record.hand_card.p2_call_handcards = Array.from(this.p2_cards);
            this.visual_handcards();
            this.viewer_update();
            // 黑桃 < 紅心 < 方塊 < 梅花 < 無王, 0 1 2 3 4
            this.hist += "---------------------叫牌開始-----------------------\n";
            //--------------------------------------------叫牌------------------------------------------------------------
            let change = true;
            let call;
            // 傳送狀態(喊牌階段)
            try {
                await this.getdata(this.p1, 14, ["call", "1"]);
            } catch (e) {
                throw new Error(e);
            }
            try {
                await this.getdata(this.p2, 14, ["call", "0"]);
            } catch (e) {
                throw new Error(e);
            }
            try {
                call = await this.getdata(this.p1, 3, 0); // p1 先喊
            } catch (e) {
                throw new Error(e);
            }
            this.record.call.push({
                player: this.p1.name,
                call_val: call,
                time_limit:{
                    p1: this.p1_timer.getMinute(),
                    p2: this.p2_timer.getMinute()
                }
            });
            this.old_call = call;
            this.hist += this.p1.name + "先手喊牌:" + call + "\n";
            while(call !== 0){
                if(change){
                    try {
                        call = await this.getdata(this.p2, 3, call);
                    } catch (e) {
                        throw new Error(e);
                    }
                    this.hist += this.p2.name + "喊牌:" + call + "\n";
                    this.record.call.push({
                        player: this.p2.name,
                        call_val: call,
                        time_limit:{
                            p1: this.p1_timer.getMinute(),
                            p2: this.p2_timer.getMinute()
                        }
                    });
                    this.judge_call(call, false);
                }
                else{
                    try {
                        call = await this.getdata(this.p1, 3, call);
                    } catch (e) {
                        throw new Error(e);
                    }
                    this.hist += this.p1.name + "喊牌:" + call + "\n";
                    this.record.call.push({
                        player: this.p1.name,
                        call_val: call,
                        time_limit:{
                            p1: this.p1_timer.getMinute(),
                            p2: this.p2_timer.getMinute()
                        }
                    });
                    this.judge_call(call, true);
                }
                change = !change;
                if(call !== 0)
                    this.old_call = call;
            }
            //--------------------------------------------叫牌------------------------------------------------------------
            // 傳送叫牌結果
            try {
                await this.getdata(this.p1, 4, this.old_call).catch((e) => {
                    console.log("p1 error")
                    throw new Error(e);
                });
            } catch (e) {
                console.log("p1 error")
                throw new Error(e);
            }
            try {
                await this.getdata(this.p2, 4, this.old_call).catch((e) => {
                    console.log("p2 error")
                    throw new Error(e);
                });
            } catch (e) {
                console.log("p2 error")
                throw new Error(e);
            }
            this.visual_trump();
            this.hist += "---------------------叫牌結束-----------------------\n";
            this.record.trump = [this.dealer_win_condition - 6, this.trump];
            this.record.dealer = this.dealer_name;
            this.viewer_update();
            this.hist += "---------------------換牌開始-----------------------\n";
            let count = 1;
            if(this.current_player){ // p1 first
                try {
                    await this.getdata(this.p1, 14, ["change", "1"]);
                } catch (e) {
                    throw new Error(e);
                }
                try {
                    await this.getdata(this.p2, 14, ["change", "0"]);
                } catch (e) {
                    throw new Error(e);
                }            
            }
            else{ // p2 first
                try {
                    await this.getdata(this.p2, 14, ["change", "1"]);
                } catch (e) {
                    throw new Error(e);
                }
                try {
                    await this.getdata(this.p1, 14, ["change", "0"]);
                } catch (e) {
                    throw new Error(e);
                }
            }
            // --------------------------------------------換牌------------------------------------------------------------
            while(this.pilecards.length !== 0){
                this.hist += "第" + count + "輪\n";
                count += 1;
                let first_player, second_player, first_handcards, second_handcards;
                let first_throw_card, second_throw_card;
                if(this.current_player){
                    first_player = this.p1;
                    second_player = this.p2;
                    first_handcards = this.p1_cards;
                    second_handcards = this.p2_cards;
                    
                }else{
                    first_player = this.p2;
                    second_player = this.p1;
                    first_handcards = this.p2_cards;
                    second_handcards = this.p1_cards;
                }
                this.to_change = this.pilecards.pop();
                this.hist += "翻開的牌:" + this.visual_card(this.to_change) + "\n";
                try {
                    first_throw_card = await this.getdata(first_player, 5, this.to_change);
                } catch (e) {
                    throw new Error(e);
                }
                this.hist += first_player.name + "出:" + this.visual_card(first_throw_card) + "\n";
                try {
                    second_throw_card = await this.getdata(second_player, 6, [this.to_change, first_throw_card]);
                } catch (e) {
                    throw new Error(e);
                }            
                this.hist += second_player.name + "出:" + this.visual_card(second_throw_card) + "\n";
                // 移除用過的牌
                first_handcards.splice(first_handcards.indexOf(first_throw_card), 1); 
                second_handcards.splice(second_handcards.indexOf(second_throw_card), 1);
                // 加牌
                // 第二張翻起來的牌
                let for_lose_card = this.pilecards.pop();
                let first_player_get, second_player_get;
                if(this.cmp(first_throw_card, second_throw_card)){
                    first_player_get = this.to_change;
                    second_player_get = for_lose_card;
                    
                }else{
                    first_player_get = for_lose_card;
                    second_player_get = this.to_change;
                }
                this.p1_cards = this.sortcard(this.p1_cards);
                this.p2_cards = this.sortcard(this.p2_cards);
                this.record.change.push({
                    go_first: first_player.name,
                    first_card: first_throw_card,
                    second_card: second_throw_card,
                    first_change_card: this.to_change,
                    first_get: first_player_get,
                    second_get: second_player_get,
                    time_limit:{
                        p1: this.p1_timer.getMinute(),
                        p2: this.p2_timer.getMinute()
                    },
                    hand_cards:{
                        p1: Array.from(this.p1_cards),
                        p2: Array.from(this.p2_cards)
                    }
                })
                this.viewer_update();
                first_handcards.push(first_player_get);
                second_handcards.push(second_player_get);
                try {
                    await this.getdata(first_player, 7, [second_throw_card, first_player_get]);
                } catch (e) {
                    throw new Error(e);
                }
                try {
                    await this.getdata(second_player, 7, [first_throw_card, second_player_get]);
                } catch (e) {
                    throw new Error(e);
                }
                this.hist += first_player.name + "拿到:" + this.visual_card(first_player_get) + "\n";
                this.hist += second_player.name + "拿到:" + this.visual_card(second_player_get) + "\n";                
                this.hist += "\n";
            }
            // --------------------------------------------換牌結束------------------------------------------------------------        
            this.record.hand_card.p1_play_handcards = Array.from(this.p1_cards);
            this.record.hand_card.p2_play_handcards = Array.from(this.p2_cards);
            this.viewer_update();
            try {
                await this.getdata(this.p1, 12);
            } catch (e) {
                throw new Error(e);
            }
            try {
                await this.getdata(this.p2, 12);
            } catch (e) {
                throw new Error(e);
            }
            this.hist += "---------------------換牌結束-----------------------\n";
            this.visual_handcards();
            this.hist += "---------------------打牌開始-----------------------\n";
            count = 1;
            this.current_player = this.first_play;
            if(this.current_player){ // p1 first
                try {
                    await this.getdata(this.p1, 14, ["play", "1"]);
                } catch (e) {
                    throw new Error(e);
                }
                try {
                    await this.getdata(this.p2, 14, ["play", "0"]);
                } catch (e) {
                    throw new Error(e);
                }
            }
            else{ // p2 first
                try {
                    await this.getdata(this.p1, 14, ["play", "0"]);
                } catch (e) {
                    throw new Error(e);
                }
                try {
                    await this.getdata(this.p2, 14, ["play", "1"]);
                } catch (e) {
                    throw new Error(e);
                }
            }
            // --------------------------------------------打牌開始------------------------------------------------------------
            while(this.p1_cards.length !== 0){
                this.hist += "第" + count + "輪\n";
                count += 1;
                let first_player, second_player, first_handcards, second_handcards;
                let first_throw_card, second_throw_card;
                if(this.current_player){
                    first_player = this.p1;
                    second_player = this.p2;
                    first_handcards = this.p1_cards;
                    second_handcards = this.p2_cards;
                }
                else{
                    first_player = this.p2;
                    second_player = this.p1;
                    first_handcards = this.p2_cards;
                    second_handcards = this.p1_cards;
                }
                try {
                    first_throw_card =  await this.getdata(first_player, 8);
                } catch (e) {
                    throw new Error(e);
                }
                this.hist += first_player.name + "出:" + this.visual_card(first_throw_card) + "\n";
                try {
                    second_throw_card =  await this.getdata(second_player, 9, first_throw_card);
                } catch (e) {
                    throw new Error(e);
                }
                this.hist += second_player.name + "出:" + this.visual_card(second_throw_card) + "\n";
                // 移除用過的牌
                first_handcards.splice(first_handcards.indexOf(first_throw_card), 1); 
                second_handcards.splice(second_handcards.indexOf(second_throw_card), 1);
                // 判斷輸贏(算分)
                let first_score;
                let second_score;
                if(!this.cmp(first_throw_card, second_throw_card)){
                    this.current_player = !this.current_player;
                    first_score = 0;
                    second_score = 1;
                }else{
                    first_score = 1;
                    second_score = 0;
                }
                if(this.current_player)
                    this.p1_score += 1;
                else
                    this.p2_score += 1;
                try {
                    await this.getdata(first_player, 10, [second_throw_card, first_score]);
                } catch (e) {
                    throw new Error(e);
                }
                try {
                    await this.getdata(second_player, 10, [first_throw_card, second_score]);
                } catch (e) {
                    throw new Error(e);
                }
                this.hist += this.p1.name + ":" + this.p1_score + "  " + this.p2.name + ":" + this.p2_score + "\n";
                this.p1_cards = this.sortcard(this.p1_cards);
                this.p2_cards = this.sortcard(this.p2_cards);
                this.record.play.push({
                    go_first: first_player.name,
                    first_play: first_throw_card,
                    second_play: second_throw_card,
                    score: {
                        p1: this.p1_score,
                        p2: this.p2_score
                    },
                    time_limit: {
                        p1: this.p1_timer.getMinute(),
                        p2: this.p2_timer.getMinute()
                    },
                    hand_cards: {
                        p1: Array.from(this.p1_cards),
                        p2: Array.from(this.p2_cards)
                    }
                })
                this.viewer_update();
            }
            // --------------------------------------------打牌結束------------------------------------------------------------
            this.hist += "---------------------打牌結束-----------------------\n";
            this.viewer_update();
            this.hist += "最終比分:\n";
            // 傳送game over
            try {
                await this.getdata(this.p1, 11);
            } catch (e) {
                throw new Error(e);
            }
            try {
                await this.getdata(this.p2, 11);
            } catch (e) {
                throw new Error(e);
            }
            this.hist += this.p1.name + ":" + this.p1_score + "  " + this.p2.name + ":" + this.p2_score + "\n";
            result = this.isEndGame();
            
        } catch (e) {
            if(e.message === 'assign winner'){
                result = this.assign_winner === this.p1.name ? this.P1 : this.P2;
                this.hist += "(指定贏家)\n";
                this.record.player.p1 = this.p1.name + "(指定贏家)";
                this.record.player.p2 = this.p2.name + "(指定贏家)";
                console.log("ASSIGN_WINNER", this.assign_winner);
            }
            else{
                result = this.early_win === this.P1 ? this.P2 : this.P1;
                console.log("someone disconnect");
            }            
        }
        this.is_end = true;
        let winner;
        if(result === this.P1){
            this.hist += this.p1.name + " win\n";
            this.p1_win += 1;
            this.update_scoreboard(this.p1.name, 1, this.p1_timer)
            winner = this.p1.name;
            // resolve(this.p1); 
        }else{
            this.hist += this.p2.name + " win\n";
            this.p2_win += 1;
            this.update_scoreboard(this.p2.name, 1, this.p2_timer)
            winner = this.p2.name;
            // resolve(this.p2);
        }
        this.record.winner = winner;
        this.push_hist(this.game_id, this.record);
        this.push_hist(this.game_id, this.hist, 'download');
        this.viewer_update();
        Object.values(this.viewers).forEach((viewer) => {
            viewer.send(
                viewer_endGame(
                    this.game_id,
                    this.p1_timer.getMinute(),
                    this.p2_timer.getMinute(),
                    this.p1_score,
                    this.p2_score
                )
            );
        });
        console.log("game end");
        resolve();
        return winner;
    }

}

module.exports = { game: game };