
const {
    viewer_endGame,
    viewer_updateTimeLimit,
    viewer_updateWinTimes,
    viewer_updateBoard,
    viewer_changeName,
} = require("./protocolTemplate.js");
const { Timer } = require("./timer.js");
const events = require('events');
const { resolve } = require("path");
const em = new events.EventEmitter();

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
        this.P1 = 1;
        this.P2 = -1;
        this.is_end = false;
        this.hist = ""; // 紀錄
        this.push_hist = push_hist;
        this.viewers = viewers;
        this.update_scoreboard = update_scoreboard;
        this.game_num = game_num;
        this.p1_win = 0;
        this.p2_win = 0;

        this.old_call = undefined;
        this.dealer = undefined; // 莊家
        this.dealer_name = undefined;
        this.dealer_win_condition = undefined; //莊家需要贏的墩數

        this.current_player = undefined; // 換牌先手

        this.to_change = undefined; // 一回合中先翻起來的牌(需要搶的)
        
        this.first_play = undefined; // 打牌先手
        this.reconnect_promise = {};
        this.cancel_request = undefined;
        this.disconnect = false;
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
        this.save_p1_cards = cardlist[2];
        this.save_p2_cards = cardlist[1];
    }

    reset = async(mode = 1) => {
        this.dealer_win_condition = undefined;
        this.p1_score = 0;
        this.p2_score = 0;
        this.disconnect = false;
        if(mode === 1){
            this.create_randomcards() // 建立新的隨機牌堆
            // 發牌
            for(let i = 0; i < 13; i++){
                this.p1_cards.push(this.pilecards.pop());
                this.p2_cards.push(this.pilecards.pop());
            }
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
            viewer.send(
                viewer_updateTimeLimit(
                    this.game_id,
                    Math.ceil(this.p1_timer.getMinute()),
                    Math.ceil(this.p2_timer.getMinute())
                )
            );
            viewer.send(
                viewer_updateWinTimes(
                    this.game_id,
                    this.p1_score,
                    this.p2_current_playerscore
                )
            );
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
            let data = viewer_updateBoard(this.game_id, this.hist, [this.trump, this.dealer_win_condition - 6], this.dealer_name)
            viewer.send(data);
        });
    }

    reconnect_socket = (name, color) => {
        let reconnect_socket_promise;
        let p = new Promise((resolve, reject) => {
            reconnect_socket_promise = resolve;
        });
        this.reconnect_promise[name] = {
            resolve: reconnect_socket_promise,
            color: color,
        };
        return p;
    };

    getdata = (player, id, in_data = null) => {
        let socket = player.socket;
        let cancel_request_promise;
        let timeout = undefined;
        let tag = "#斷線";
        let timer = this.current_player === this.P1 ? this.p1_timer : this.p2_timer;
        let p = new Promise(async(resole, reject) => {
            cancel_request_promise = (cancel_id) => {
                if (cancel_id !== game.CANCEL_OUT_OF_TIME) {
                    this.timer.release();
                }
                try {
                    clearTimeout(timeout);
                } catch (e) {
                    console.log(e);
                }
                reject(cancel_id);
            };

            let disconnect_pack = async() => {
                let timeout = setTimeout(() => {
                    // timer.hold(request_reject)
                }, 1000 * 60);
                if (this.current_player === this.P1) {
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
                socket = await this.reconnect_socket(player.name, this.current_player);
                clearTimeout(timeout);
                this.timer.release();
                tag = "#斷線";
                Object.values(this.viewers).forEach((viewer) => {
                    viewer.send(
                        viewer_changeName(this.game_id, this.p1.name, this.p2.name)
                    );
                });
            };

            if (socket.readyState === 3) {
                await disconnect_pack();
            }

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
            socket.send(JSON.stringify(data_send));
            
            // let restore_pack = () => {
            //     socket.addEventListener("message", handler); 
            //     socket.addEventListener("close", handler_close);
            //     // socket.send(
            //     //     this.player_request_data(id, data)
            //     // );
            //     // this.timer = new timer(this, this.current_player);
            // };

            let handler = (message) => {
                try {
                    // socket.removeEventListener("message", handler);
                    let get_data = JSON.parse(message.data);
                    // console.log(get_data)
                    switch(get_data.id){
                        case 0 : // ready
                            break;
                        case 2 : // deal
                            break;
                        case 3 : // call
                            socket.removeEventListener("message", handler);
                            resole(get_data.player_call);
                            break;
                        case 4 : // call_result
                            break;
                        case 5 : // change_first
                            socket.removeEventListener("message", handler);
                            resole(get_data.player_card_for_change);
                            break;
                        case 6 : // change_second
                            socket.removeEventListener("message", handler);
                            resole(get_data.player_card_for_change);
                            break;
                        case 7 : // change_result
                            break;
                        case 8 : // play_card_first
                            socket.removeEventListener("message", handler);
                            resole(get_data.player_play);
                            break;
                        case 9 : // play_card_second
                            socket.removeEventListener("message", handler);
                            resole(get_data.player_play);
                            break;
                        case 10 : // play_card_result
                            break;
                        case 11: // game_over
                            break;
                        case 12: // change_finall
                            break;
                        case 13: // test
                            break;
                        default:
                            break;
                    }
                    socket.removeEventListener("message", handler);
                    socket.removeEventListener("close", handler_close);
                    resole();
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
                // await disconnect_pack();
                // reject();
                resolve();
            };
            socket.addEventListener("message", handler);
            socket.addEventListener("close", handler_close);
            // socket.removeEventListener("message", handler);
            // let handler_close = async() => {
            //     socket.removeEventListener("message", handler);
            //     socket.removeEventListener("close", handler_close);
            //     // this.timer.release();
            //     restore_pack();
            // };
            // restore_pack();
            // resole()
        })
        // this.cancel_request = cancel_request_promise;
        return p;
    }

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
            if(Math.floor(defensive) === this.trump)
                return 0;
            else
                return 1;
        }
    }
    
    change_card = async(first_player, first_handcards, second_player, second_handcards) => {
        this.to_change = this.pilecards.pop();
        // console.log("翻開的牌:" + this.visual_card(this.to_change));
        this.hist += "翻開的牌:" + this.visual_card(this.to_change) + "\n";
        let first_throw_card =  await this.getdata(first_player, 5, this.to_change);
        // console.log(first_player.name + "出:" + this.visual_card(first_throw_card));
        this.hist += first_player.name + "出:" + this.visual_card(first_throw_card) + "\n";
        let second_throw_card =  await this.getdata(second_player, 6, [this.to_change, first_throw_card]);
        // console.log(second_player.name + "出:" + this.visual_card(second_throw_card));
        this.hist += second_player.name + "出:" + this.visual_card(second_throw_card) + "\n";
        // 移除用過的牌
        first_handcards.splice(first_handcards.indexOf(first_throw_card), 1); 
        second_handcards.splice(second_handcards.indexOf(second_throw_card), 1);
        // 加牌
        // 第二張翻起來的牌
        let for_lose_card = this.pilecards.pop();
        if(this.cmp(first_throw_card, second_throw_card)){
            first_handcards.push(this.to_change);
            second_handcards.push(for_lose_card);
            await this.getdata(first_player, 7, [second_throw_card, this.to_change]);
            await this.getdata(second_player, 7, [first_throw_card, for_lose_card]);
            // console.log(first_player.name + "拿到:" + this.visual_card(this.to_change));
            this.hist += first_player.name + "拿到:" + this.visual_card(this.to_change) + "\n";
            // console.log(second_player.name + "拿到:" + this.visual_card(for_lose_card));
            this.hist += second_player.name + "拿到:" + this.visual_card(for_lose_card) + "\n";
        }
        else{
            second_handcards.push(this.to_change);
            first_handcards.push(for_lose_card);
            this.current_player = !this.current_player;
            await this.getdata(first_player, 7, [second_throw_card, for_lose_card]);
            await this.getdata(second_player, 7, [first_throw_card, this.to_change]);
            // console.log(first_player.name + "拿到:" + this.visual_card(for_lose_card));
            this.hist += first_player.name + "拿到:" + this.visual_card(for_lose_card) + "\n";
            // console.log(second_player.name + "拿到:" + this.visual_card(this.to_change));
            this.hist += second_player.name + "拿到:" + this.visual_card(this.to_change) + "\n";
        }
    }

    play_card = async(first_player, first_handcards, second_player, second_handcards) => {
        let first_throw_card =  await this.getdata(first_player, 8);
        // console.log(first_player.name + "出:" + this.visual_card(first_throw_card));。。
        this.hist += first_player.name + "出:" + this.visual_card(first_throw_card) + "\n";
        let second_throw_card =  await this.getdata(second_player, 9, first_throw_card);
        // console.log(second_player.name + "出:" + this.visual_card(second_throw_card));
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
        await this.getdata(first_player, 10, [second_throw_card, first_score]);
        await this.getdata(second_player, 10, [first_throw_card, second_score]);
    }

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

    // gg = () => {
    //     em.emit("disconnect");
    // }



    play = async(mode) => {
        await this.reset(mode);
        return new Promise(async(resolve, reject) => {
            // try{
                await this.getdata(this.p1, 0);
                await this.getdata(this.p2, 0);
                // reset
                
                await this.getdata(this.p1, 1);
                await this.getdata(this.p2, 1);
                // 傳手牌
                await this.getdata(this.p1, 2, this.p1_cards);
                await this.getdata(this.p2, 2, this.p2_cards);
                this.visual_handcards();
                this.viewer_update();
                // this.gg();
                // --------------------------------------------叫牌------------------------------------------------------------
                // 黑桃 < 紅心 < 方塊 < 梅花 < 無王, 0 1 2 3 4
                // console.log("---------------------叫牌開始-----------------------");
                this.hist += "---------------------叫牌開始-----------------------\n";
                await this.call_card();
                await this.getdata(this.p1, 4, this.old_call);
                await this.getdata(this.p2, 4, this.old_call);
                this.visual_trump();
                // console.log("---------------------叫牌結束-----------------------");
                this.hist += "---------------------叫牌結束-----------------------\n";
                this.viewer_update();
                // resolve();
                // --------------------------------------------換牌------------------------------------------------------------
                // console.log("---------------------換牌開始-----------------------");
                this.hist += "---------------------換牌開始-----------------------\n";
                let count = 1;
                if(this.current_player){ // p1 first
                    await this.getdata(this.p1, 14, ["change", "1"])
                    await this.getdata(this.p2, 14, ["change", "0"])
                }
                else{ // p2 first
                    await this.getdata(this.p2, 14, ["change", "1"])
                    await this.getdata(this.p1, 14, ["change", "0"])
                }
                while(this.pilecards.length !== 0){
                    // console.log("第" + count + "輪");
                    this.hist += "第" + count + "輪\n";
                    count += 1;
                    if(this.current_player){
                        await this.change_card(this.p1, this.p1_cards, this.p2, this.p2_cards);
                    }
                    else{
                        await this.change_card(this.p2, this.p2_cards, this.p1, this.p1_cards);
                    }
                    // console.log();
                    this.hist += "\n";
                }
                // 牌組整理
                await this.getdata(this.p1, 12);
                await this.getdata(this.p2, 12);
                // console.log(this.p1_cards.sort(function(a, b) {
                //     return a - b;
                // }))
                // console.log(this.p2_cards.sort(function(a, b) {
                //     return a - b;
                // }))
                // console.log("---------------------換牌結束-----------------------");
                this.hist += "---------------------換牌結束-----------------------\n";
                this.visual_handcards();
                viewer_updateBoard(this.game_id, this.hist, [this.trump, this.dealer_win_condition - 6], this.dealer_name);
                // // // --------------------------------------------打牌------------------------------------------------------------
                // console.log("---------------------打牌開始-----------------------")
                this.hist += "---------------------打牌開始-----------------------\n";
                count = 1;
                this.current_player = this.first_play;
                if(this.current_player){ // p1 first
                    await this.getdata(this.p1, 14, ["play", "1"])
                    await this.getdata(this.p2, 14, ["play", "0"])
                }
                else{ // p2 first
                    await this.getdata(this.p2, 14, ["play", "1"])
                    await this.getdata(this.p1, 14, ["play", "0"])
                }
                while(this.p1_cards.length !== 0){
                    // console.log("第" + count + "輪");
                    this.hist += "第" + count + "輪\n";
                    count += 1;
                    if(this.current_player){
                        await this.play_card(this.p1, this.p1_cards, this.p2, this.p2_cards);
                    }
                    else{
                        await this.play_card(this.p2, this.p2_cards, this.p1, this.p1_cards);
                    }
                    // console.log(this.p1.name + ":" + this.p1_score + "  " + this.p2.name + ":" + this.p2_score)
                    this.hist += this.p1.name + ":" + this.p1_score + "  " + this.p2.name + ":" + this.p2_score + "\n";
                }
                // console.log("---------------------打牌結束-----------------------");
                this.hist += "---------------------打牌結束-----------------------\n";
                this.viewer_update();
                // console.log("最終比分:");
                this.hist += "最終比分:\n";
                await this.getdata(this.p1, 11)
                await this.getdata(this.p2, 11)
                // console.log(this.p1.name + ":" + this.p1_score + "  " + this.p2.name + ":" + this.p2_score);
                this.hist += this.p1.name + ":" + this.p1_score + "  " + this.p2.name + ":" + this.p2_score + "\n";
                let result = this.isEndGame();
                this.is_end = true;
                if(result === this.P1){
                    // console.log(this.p1.name + " win");
                    this.hist += this.p1.name + " win\n";
                    this.push_hist(this.game_id, this.hist, this.game_num);
                    this.p1_win += 1;
                    this.update_scoreboard(this.p1.name, 1, this.p1_timer)
                    // resolve(this.p1); 
                }else{
                    // console.log(this.p2.name + " win");
                    this.hist += this.p2.name + " win\n";
                    this.push_hist(this.game_id, this.hist, this.game_num);
                    this.p2_win += 1;
                    this.update_scoreboard(this.p2.name, 1, this.p2_timer)
                    // resolve(this.p2);
                }
                this.viewer_update();
                Object.values(this.viewers).forEach((viewer) => {
                    viewer.send(
                        viewer_updateWinTimes(
                            this.game_id,
                            this.p1_score,
                            this.p2_score
                        )
                    );
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
                resolve();
                // return;
            // } catch (err) {
            //     this.update_scoreboard(this.p1.name, 1, this.p1_time_limit);
            //     this.is_end = true;
            //     Object.values(this.viewers).forEach((viewer) => {
            //         viewer.send(
            //             viewer_endGame(
            //                 this.game_id,
            //                 Math.ceil(this.p1_time_limit / (60 * 1000)),
            //                 Math.ceil(this.p2_time_limit / (60 * 1000)),
            //                 0,
            //                 0
            //             )
            //         );
            //     });
            //     console.log("PPPPPPPPPPPPPPPPPPPPPPPPPPP")
            //     resolve();
            // }
        })
    }

    // BO2 = async() =>{
    //     return new Promise(async(resolve) => {
    //         let p1_win = 0;
    //         let p2_win = 0;
    //         let game1 = await this.play();
    //         if(game1 === this.p1)
    //             p1_win += 1;
    //         else
    //             p2_win += 1;
            
    //     })
    // }
}

module.exports = { game: game };