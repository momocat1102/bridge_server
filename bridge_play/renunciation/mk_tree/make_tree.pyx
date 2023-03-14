# cython: language_level=3
cdef int cmp(int offensive, int defensive, int trump):
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
        
cdef list can_play(int offensive, list defensive_list): #算出可以出什麼
    cdef list can_play_list = list()
    cdef list temp_list = [-1, -1, -1, -1]
    cdef int count = 0
    for defensive in defensive_list:
        if defensive//13 == offensive//13:
            can_play_list.append(defensive)
            
    if len(can_play_list) == 0:                
        for i in range(len(defensive_list)):
            for j in range(count, 4):
                if defensive_list[i] // 13 == j:
                    count = j
                    break
            if temp_list[count] == -1:
                temp_list[count] = 1
                can_play_list.append(defensive_list[i])
                
    return can_play_list

cdef list delete_card(list first_cards, list second_cards, int offensive, int defensive):
    cdef list new_first_cards = list(first_cards)
    cdef list new_second_cards = list(second_cards)
    new_first_cards.remove(offensive)
    new_second_cards.remove(defensive)
    return [new_first_cards, new_second_cards]

cpdef list tree(list first_cards, list second_cards, int trump, dict tree_table):
    assert len(first_cards) == len(second_cards)
    # key = f:[first_cards]s:[second_cards]t:[trump]
    first_cards.sort()
    second_cards.sort()
    table_key = "f:" + str(first_cards) + "s:" + str(second_cards) + "t:" + str(trump)
    cdef int off_best, off_max, off_curr
    cdef int def_best, def_max, def_curr, to_play, is_offwin
    cdef dict def_dict = dict() # 儲存不同先手下，後手的最佳解
    cdef dict defscore_dict = dict()
    cdef list defensive_list  # 儲存不同先手下，後手的最佳解的分數
    cdef list new_headcards, new_score
    # 如果當前狀態還未算過
    if table_key not in tree_table.keys():
        off_best = first_cards[0]
        off_max  = -1 #先手最高分
        off_curr = -1 #先手在不同情況的分數
        # 先手出牌
        for offensive in first_cards:
            # 過濾出後手可出的牌    
            defensive_list = can_play(offensive, second_cards)
            # 後手出牌
            def_best = defensive_list[0]
            def_max  = -1 #後手最高分
            def_curr = -1 #後手在不同情況的分數
            to_play = defensive_list[0]            
            if(defensive_list[0]//13 == offensive//13): # 能出的為同花色的
                new_headcards = delete_card(first_cards, second_cards, offensive, to_play)
                is_offwin = cmp(offensive, to_play, trump)
                if len(new_headcards[1]) > 0:
                    if is_offwin:
                        new_score = tree(new_headcards[0], new_headcards[1], trump, tree_table)# 新狀態下，兩邊都沒失誤的分數
                        tmp_o, tmp_d = new_score[0], new_score[1]
                        def_curr = tmp_d
                    else:
                        new_score = tree(new_headcards[1], new_headcards[0], trump, tree_table)# 新狀態下，兩邊都沒失誤的分數
                        tmp_o, tmp_d = new_score[0], new_score[1]
                        def_curr = tmp_o + 1
                        
                    if def_curr > def_max:
                        #先手出完牌後，輸贏就由後手決定，因此只有當前先手的分數是根據後手最佳解改變的，
                        if is_offwin:
                            off_curr = tmp_o + 1
                        else:
                            off_curr = tmp_d
                else: #當雙方已經沒牌時
                    if is_offwin:
                        off_curr = 1
                        def_curr = 0
                    else:
                        off_curr = 0
                        def_curr = 1
                        
                if def_curr > def_max:
                        def_max = def_curr
                        def_best = to_play

                if to_play < offensive: # 表示可能有贏的機會-------------------------------------------------------------------------

                    for defensive in defensive_list:
                        if defensive > offensive:
                            to_play = defensive
                            break
                    if(to_play != defensive_list[0]):
                        new_headcards = delete_card(first_cards, second_cards, offensive, to_play)
                        if len(new_headcards[1]) > 0:
                            new_score = tree(new_headcards[1], new_headcards[0], trump, tree_table)
                            tmp_o, tmp_d = new_score[0], new_score[1]
                            def_curr = tmp_o + 1
                                
                            if def_curr > def_max:
                                #先手出完牌後，輸贏就由後手決定，因此只有當前先手的分數是根據後手最佳解改變的，
                                off_curr = tmp_d
                        else: #當雙方已經沒牌時
                            off_curr = 0
                            def_curr = 1

                        if def_curr > def_max:
                                def_max = def_curr
                                def_best = to_play
            else: # 能出的為不同花色的
                for defensive in defensive_list:
                    is_offwin = cmp(offensive, defensive, trump)
                    new_headcards = delete_card(first_cards, second_cards, offensive, to_play)
                    if len(new_headcards[1]) > 0:
                        if is_offwin:
                            new_score = tree(new_headcards[0], new_headcards[1], trump, tree_table)# 新狀態下，兩邊都沒失誤的分數
                            tmp_o, tmp_d = new_score[0], new_score[1]
                            def_curr = tmp_d
                        else:
                            new_score = tree(new_headcards[1], new_headcards[0], trump, tree_table)# 新狀態下，兩邊都沒失誤的分數
                            tmp_o, tmp_d = new_score[0], new_score[1]
                            def_curr = tmp_o + 1
                            
                        if def_curr > def_max:
                            #先手出完牌後，輸贏就由後手決定，因此只有當前先手的分數是根據後手最佳解改變的，
                            if is_offwin:
                                off_curr = tmp_o + 1
                            else:
                                off_curr = tmp_d
                    else: #當雙方已經沒牌時
                        if is_offwin:
                            off_curr = 1
                            def_curr = 0
                        else:
                            off_curr = 0
                            def_curr = 1
                            
                    if def_curr > def_max:
                            def_max = def_curr
                            def_best = to_play
                        
            def_dict[offensive] = def_best
            defscore_dict[offensive] = def_max
            #先手出不同牌時，後手的最高分會有所變化，因此要選擇讓其為最低的牌
            if off_curr > off_max:
                off_max = off_curr
                off_best = offensive
                               #[先手分數, 後手分數, 先手最佳, 後手最佳對應]
        tree_table[table_key] = [off_max, defscore_dict[off_best], off_best, def_dict]
        return [off_max, defscore_dict[off_best]]
    else:
        return [tree_table[table_key][0], tree_table[table_key][1]]

def build_tree(list first_cards, list second_cards, int trump, dict tree_table):
    tree(first_cards, second_cards, trump, tree_table)
    return tree_table