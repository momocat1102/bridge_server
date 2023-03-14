import random
import time
from mk_tree import make_tree

def cmp(offensive, defensive, trump):
    if defensive//13 == offensive//13: #同花
        if offensive > defensive:
            return 1
        elif offensive < defensive:
            return 0
        else:
            raise ValueError("There are two same cards!!")
    else:
        if defensive//13 == trump : #defensive//13 為0-3
            return 0
        else:
            return 1

# 視覺化手牌
def print_handcard(p1, p2, trump):
    number_list = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A']
    shape = ['黑桃', '紅心', '方塊', '梅花', '無王']
    shape_list = list()
    shape_list.append([[] for _ in range(4)])
    shape_list.append([[] for _ in range(4)])
    count = 0
    print("王牌為:", shape[trump])
    for cards in [p1, p2]:
        for card in cards:
            for i in range(4):
                if card // 13 == i:
                    shape_list[count][i].append(number_list[card % 13])
                    break
        count = 1
    # print(shape_list)
    for j in range(len(shape_list)):
        if j == 0:
            print("p1：")
        else:
            print("p2：")
        for i in range(len(shape) - 1):
            if len(shape_list[j][i]) != 0:
                print(shape[i] + ":", shape_list[j][i])
        print("---------------------------------------------------")
# 可視化牌
def print_onecard(name, card):
    number_list = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A']
    shape = ['黑桃', '紅心', '方塊', '梅花', '無王']
    print(name + ": " + shape[card//13] + number_list[card % 13])

def random_play(first, mycard_list, opp_card = -1): #算出可以出什麼
    can_play_list = list()
    if first == "second":
        for mycard in mycard_list:
            if mycard//13 == opp_card//13:
                can_play_list.append(mycard)

        if len(can_play_list) == 0:
            can_play_list = mycard_list
    else:
        can_play_list = mycard_list
    card = random.randint(0, len(can_play_list) - 1)      
    return can_play_list[card]



def play(first, second, trump, tree_table):
    card_first = "win"
    # n = len(first)
    key = "f:" + str(first) + "s:" + str(second) + "t:" + str(trump)
    if(tree_table[key][0] > tree_table[key][1]):
        win, lose = first, second
    else:
        win, lose = second, first
        card_first = "lose"
    score = [0,0]
    while len(win):
        # print("\n##################### %d #####################\n" %int(n-len(win)))
        # print_handcard(win, lose, trump)
        if card_first == "win":
            try:
                offensive = tree_table[key][2]
            except:
                # print("+++++++++++++++++")
                # print("重新產生tree")
                # print(key)
                # print(win, lose)
                # print("+++++++++++++++++")
                tree_table = dict()
                tree_table = make_tree.build_tree(win, lose, trump, tree_table)
                offensive = tree_table[key][2]
            
            # print_onecard("win", offensive)
            defensive = random_play("second", lose, offensive)
            # print_onecard("lose", defensive)
            is_offwin = cmp(offensive, defensive, trump)
            # print(f"是否獲勝:{is_offwin}" )
            win.remove(offensive)
            lose.remove(defensive)
            if is_offwin:
                key = "f:" + str(win) + "s:" + str(lose) + "t:" + str(trump)
                card_first = "win"
                score[0] += 1
            else:
                key = "f:" + str(lose) + "s:" + str(win) + "t:" + str(trump)
                card_first = "lose"
                score[1] += 1
        else:
            # print(key)
            offensive = random_play("first", lose)
            # print_onecard("lose", offensive)
            try:
                defensive = tree_table[key][3][offensive]
            except:
                # print("+++++++++++++++++")
                # print("重新產生tree")
                # print(key)
                # print(win, lose)
                # print("+++++++++++++++++")
                tree_table = dict()
                tree_table = make_tree.build_tree(lose, win, trump, tree_table)
                defensive = tree_table[key][3][offensive]
            # print_onecard("win", defensive)
            is_offwin = cmp(offensive, defensive, trump)
            # print(f"是否獲勝:{is_offwin}" )
            win.remove(defensive)
            lose.remove(offensive)
            if is_offwin:
                key = "f:" + str(lose) + "s:" + str(win) + "t:" + str(trump)
                card_first = "lose"
                score[1] += 1
            else:
                key = "f:" + str(win) + "s:" + str(lose) + "t:" + str(trump)
                card_first = "win"
                score[0] += 1
    if(score[0] > score[1]):
        return 1
    else:
        return 0
    # print("final score:",score)

def main():
    num = 50
    path = "./test_data.txt"
    with open(path, 'w') as f:
        for _ in range(50):
            x = random.sample(range(0,52), 26)
            trump = random.randint(0, 4)
            P1, P2 = x[0:13], x[13:]
            P1.sort()
            P2.sort()
            # P1 = [13, 4, 42, 24, 44, 26, 35, 25, 36, 45, 37, 48, 43]
            # P2 = [22, 40, 12, 28, 17, 31, 38, 15, 41, 39, 6, 20, 0]
            p1, p2 = list(P1), list(P2)
            trump = 0
            print(f"p1 = {p1}\np2 = {p2}")
            f.write("p1 = " + str(p1)  + "\np2 = " + str(p2) + "\n")
            tree_table = dict()
            # p1先手
            score = 0
            tree_table = make_tree.build_tree(p1, p2, trump, tree_table)
            key = "f:" + str(p1) + "s:" + str(p2) + "t:" + str(trump)
            print(f"p1:{tree_table[key][0]}, p2:{tree_table[key][1]}")
            f.write("p1:" + str(tree_table[key][0]) + " p2:" + str(tree_table[key][1]) + "\n")
            for i in range(num):
                p1, p2 = list(P1), list(P2)
                print(f"p1先手:---{i + 1}場")
                score += play(p1, p2, trump, tree_table)
            print(f"p1先手之勝率：{score/num}")
            f.write("p1先手之勝率：" + str(score/num) + "\n")
            # p2先手
            f.write("-------------先後手交換---------------\n")
            score = 0
            tree_table = dict()
            p1, p2 = list(P1), list(P2)
            print(f"p1 = {p1}\np2 = {p2}")
            tree_table = make_tree.build_tree(p2, p1, trump, tree_table)
            p1.sort(), p2.sort()
            key = "f:" + str(p2) + "s:" + str(p1) + "t:" + str(trump)
            print(f"p1:{tree_table[key][1]}, p2:{tree_table[key][0]}")
            f.write("p1:" + str(tree_table[key][1]) + " p2:" + str(tree_table[key][0]) + "\n")
            for i in range(num):
                p1, p2 = list(P1), list(P2)
                print(f"p2先手:---{i + 1}場")
                score += play(p2, p1, trump, tree_table)
            print(f"p2先手之勝率：{score/num}")
            f.write("p2先手之勝率：" + str(score/num) + "\n")
            f.write("-------------------------------------------------------------------\n")


if '__main__' == __name__:
    main()