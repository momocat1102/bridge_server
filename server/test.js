

// let visual_handcards = (p1_cards, p2_cards, trump) => {
//     let number_list = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
//     let shape = ['黑桃', '紅心', '方塊', '梅花', '無王'];
//     let shape_list = [[[], [], [], []], [[], [], [], []]];
//     let count = 0;
//     console.log("王牌為:", shape[trump]);
//     for(let i = 0; i < p1_cards.length; i++){
//         for(let j = 0; j < 4; j++){
//             if(Math.floor(p1_cards[i] / 13) === j){
//                 // console.log(Math.floor(p1_cards[i] / 13));
//                 shape_list[count][j].push(number_list[p1_cards[i] % 13]);
//                 break;
//             }
//         }
//     }
//     count++;
//     for(let i = 0; i < p2_cards.length; i++){
//         for(let j = 0; j < 4; j++){
//             if(Math.floor(p2_cards[i] / 13) === j){
//                 // console.log(Math.floor(p1_cards[i] / 13));
//                 shape_list[count][j].push(number_list[p2_cards[i] % 13]);
//                 break;
//             }
//         }
//     }
//     for(let j = 0; j < shape_list.length; j++){
//         if(j === 0)
//             console.log("p1:");
//         else
//             console.log("p2:");
//         for(let i = 0; i < 4; i++){
//             // if(shape_list[j][i].length !== 0)
//             console.log(shape[i] + ":" + shape_list[j][i])
//         }
//     }
// }

// let visual_card = (card) => {
//     let number_list = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
//     let shape = ['黑桃', '紅心', '方塊', '梅花'];
//     console.log(shape[Math.floor(card / 13)] + number_list[card % 13])

// }

// let p1 = [0, 1, 2, 5, 11, 12, 13, 16, 17, 25, 30, 47, 49];
// let p2 = [3, 7, 8, 9, 18, 21, 22, 26, 29, 31, 32, 36, 38];

// // visual_handcards(p1, p2, 1);
// visual_card(33);

// function promise() {
//     return new Promise((resolve, reject) => {
//       // 隨機取得 0 or 1
//       const num = Math.random() > 0.5 ? 1 : 0;
  
//       // 1 則執行 resolve，否則執行 reject
//       if (num) {
//         resolve('成功');
//         return;
//         console.log("PPPPPPPPPPPPPPPPP");
//       }
//       reject('失敗');
//       console.log("OOOOOOOOOOOOOOOOOOO");
//     });
//   }
const events = require('events');
const em = new events.EventEmitter();
class test {
    gg = () => {
        em.emit("YYY");
    }

    oo = () => {
        console.log("SKASHDLK");
    }

    play = async() => {
        return new Promise(async(resolve, reject) => {
            try {
                em.on("YYY", () => {
                    throw new Error("JJJ");
                    reject(new Error("JJJ"));
                    return;
                })
                this.gg();
                console.log("KKKKKKKKKKKK");
                setTimeout(this.oo, 10000)
                resolve();
            } catch (err) {
                console.error("dis");
                reject("ddd")
            }
        });
    }
    
}

let go = async() => {
    for(let i = 0; i < 5; i++){
        let j = new test();
        await j.play()
        .catch(err => {
            console.log("LLLL")
        });

        
    }
}
go();

// let x = [2, 3, 4, 5, 6];
// let y = []
// y = Array.from(x);
// x.pop()
// console.log(x, y)
// promise()
//   .then((success) => {
//     console.log(success);
//   }, (fail) => {
//     console.log(fail);
//   })