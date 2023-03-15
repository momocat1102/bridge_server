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
    cdef int lto = -1
    cdef int gto = -1
    cdef list can_play_same = []
    cdef list can_play_void = []
    cdef list can_play_suit = [0, 0, 0, 0]

    for defensive in defensive_list:
        if defensive//13 == offensive//13:
            if lto == -1 and defensive < offensive: 
                can_play_same.append(defensive)
                lto = 1
            elif gto == -1 and defensive > offensive: 
                can_play_same.append(defensive)
                gto = 1
            elif lto + gto == 0:
                continue
            elif lto + gto == 2:
                break
        elif can_play_suit[defensive//13] == 0: 
            
            can_play_void.append(defensive)
            can_play_suit[defensive//13] = 1
    
    if len(can_play_same) == 0:
        return can_play_void
    else:
        return can_play_same    

cdef tuple get_concat(first_cards, second_cards):
    cdef dict player_table = {}
    
    for i in first_cards : player_table[i] = 0b0
    for i in second_cards: player_table[i] = 0b1
    cdef list total =  first_cards + second_cards
    total.sort()
    
    return total, player_table

cdef list filter_first(list total, dict player_table):

    cdef list equ_list = []
    cdef int start = 0
    cdef int state = False
    cdef int curr_suit = 0
    for i in range(len(total)):
     
        if (player_table[total[i]] == 0b1 or curr_suit != total[i]//13) and state == True:
            if i != start:
                equ_list.append(total[start:i])
            state = False
        if player_table[total[i]] == 0b0 and state == False:
            state = True
            start = i
            
        curr_suit = total[i]//13
        
    if state == True: equ_list.append(total[start:])

    return equ_list

cdef tuple get_keyandmap(concat, player_table):
    cdef list key = [1,1,1,1]
    cdef dict concat_map = {}
    for i in range(len(concat)):
        
        concat_map[concat[i]] = i
        concat_map[i+100] = concat[i]
        key[concat[i]//13] = (key[concat[i]//13] << 1) + player_table[concat[i]]         

    return key, concat_map

#cdef tuple filter_first(list first_cards, list second_cards):
#    
#    cdef dict player_table = {}
#    cdef int n1 = len(first_cards)
#    cdef int n2 = len(second_cards)
#    for i in first_cards : player_table[i] = 0
#    for i in second_cards: player_table[i] = 1
#     
#    total =  first_cards + second_cards
#    total.sort()
#    
#    cdef list equ_list = []
#    cdef int start = 0
#    cdef int state = False
#    cdef int curr_suit = 0
#    cdef list key = [1,1,1,1]
#    cdef dict concat_map = {}
#    for i in range(n1+n2):
#        concat_map[total[i]] = i
#        concat_map[i+100] = total[i]
#        key[total[i]//13] = (key[total[i]//13] << 1) + player_table[total[i]]
#        if (player_table[total[i]] == 1 or curr_suit != total[i]//13) and state == True:
#            if i != start:
#                equ_list.append(total[start:i])
#            state = False
#        if player_table[total[i]] == 0 and state == False:
#            state = True
#            start = i
#        curr_suit = total[i]//13
#        
#    if state == True:
#        equ_list.append(total[start:])
#    return equ_list, key, concat_map

cpdef tuple play_card(list first_cards, list second_cards, int trump, dict tree_table):
    #assert len(first_cards) == len(second_cards) 
    cdef int n = len(first_cards)
    cdef int off_best, off_max, off_curr
    cdef int def_best, def_max, def_curr, is_offwin
    cdef dict def_dict = dict() # 儲存不同先手下，後手的最佳解
    cdef dict defscore_dict = dict()#儲存不同先手下，後手的最佳解的分數
    cdef list offensive_list, defensive_list
    cdef list new_first_cards, new_second_cards

    cdef list key, concat
    cdef dict card_index_double_map, player_table
    concat, player_table = get_concat(first_cards, second_cards)
    key, card_index_double_map = get_keyandmap(concat, player_table)
    key.append(trump)
    cdef tuple table_key = tuple(key)
    # 如果當前狀態還未算過
    if table_key not in tree_table.keys():
        first_cards.sort()
        second_cards.sort()
        offensive_list = filter_first(concat, player_table)
        off_best = offensive_list[0][0]
        off_max  = -1 #先手最高分
        off_curr = -1 #先手在不同情況的分數
        # 先手出牌
        for offensive in offensive_list:
            # 過濾出後手可出的牌    
            defensive_list = can_play(offensive[0], second_cards)
            # 後手
            def_best = defensive_list[0]
            def_max  = -1 #後手最高分
            def_curr = -1 #後手在不同情況的分數
            
            new_first_cards = list(first_cards)
            new_first_cards.remove(offensive[0])
            for defensive in defensive_list:
                is_offwin = cmp(offensive[0], defensive, trump)
                new_second_cards = list(second_cards)
                new_second_cards.remove(defensive)
                if n > 1:
                    if is_offwin: 
                        tmp_o, tmp_d = play_card(new_first_cards, new_second_cards, trump, tree_table)#新狀態下，兩邊都沒失誤的分數
                        def_curr = tmp_d
                    else:
                        tmp_o, tmp_d = play_card(new_second_cards, new_first_cards, trump, tree_table)#新狀態下，兩邊都沒失誤的分數
                        def_curr = tmp_o + 1
                
                    if def_curr > def_max:
                        def_max = def_curr
                        def_best = defensive
                        #先手出完牌後，輸贏就由後手決定，因此當前先手的分數是根據後手最佳解改變的，
                        if is_offwin:
                            off_curr = tmp_o + 1
                        else:
                            off_curr = tmp_d
                else: #當雙方已經沒牌時
                    off_max = 1 if is_offwin else 0
                    def_max = 1 - off_max
            #end defensive loop 
            for off_eq in offensive: 
                #存index
                def_dict[card_index_double_map[off_eq]] = card_index_double_map[def_best]
                defscore_dict[card_index_double_map[off_eq]] = def_max
            #先手出不同牌時，後手所對應的最高分會改變，因此要選擇讓其為最低的牌
            if off_curr > off_max:
                off_max = off_curr
                off_best = offensive[0]
        tree_table[table_key] = [off_max, n-off_max, card_index_double_map[off_best], def_dict]
        return off_max, n-off_max
    else:
        return tree_table[table_key][0], tree_table[table_key][1]
cpdef tuple play_card_score_only(list first_cards, list second_cards, int trump, dict tree_table):
    cdef int n = len(first_cards)
    cdef int off_max, off_curr
    cdef int def_max, def_curr, is_offwin

    cdef list offensive_list, defensive_list
    cdef list new_first_cards, new_second_cards

    cdef list key, concat
    cdef dict  player_table
    concat, player_table = get_concat(first_cards, second_cards)
    key, _ = get_keyandmap(concat, player_table)
    key.append(trump)
    cdef tuple table_key = tuple(key)
    # 如果當前狀態還未算過
    if table_key not in tree_table.keys():
        first_cards.sort()
        second_cards.sort()
        offensive_list = filter_first(concat, player_table)
        off_max  = -1 #先手最高分
        off_curr = -1 #先手在不同情況的分數
        # 先手出牌
        for offensive in offensive_list:
            # 過濾出後手可出的牌    
            defensive_list = can_play(offensive[0], second_cards)
            # 後手
            def_max  = -1 #後手最高分
            def_curr = -1 #後手在不同情況的分數
            
            new_first_cards = list(first_cards)
            new_first_cards.remove(offensive[0])
            for defensive in defensive_list:
                is_offwin = cmp(offensive[0], defensive, trump)
                new_second_cards = list(second_cards)
                new_second_cards.remove(defensive)
                if n > 1:
                    if is_offwin: 
                        tmp_o, tmp_d = play_card_score_only(new_first_cards, new_second_cards, trump, tree_table)#新狀態下，兩邊都沒失誤的分數
                        def_curr = tmp_d
                    else:
                        tmp_o, tmp_d = play_card_score_only(new_second_cards, new_first_cards, trump, tree_table)#新狀態下，兩邊都沒失誤的分數
                        def_curr = tmp_o + 1
                
                    if def_curr > def_max:
                        def_max = def_curr
                        #先手出完牌後，輸贏就由後手決定，因此當前先手的分數是根據後手最佳解改變的，
                        if is_offwin:
                            off_curr = tmp_o + 1
                        else:
                            off_curr = tmp_d
                else: #當雙方已經沒牌時
                    off_max = 1 if is_offwin else 0
                    def_max = 1 - off_max
                    
                if def_max == n:
                    break
            #end defensive loop 
            #先手出不同牌時，後手所對應的最高分會改變，因此要選擇讓其為最低的牌
            if off_curr > off_max:
                off_max = off_curr
        tree_table[table_key] = off_max
        return off_max, n-off_max
    else:
        return tree_table[table_key], n-tree_table[table_key]
        
def mk_tree(first_cards, second_cards, trump, tree_table):
    return play_card(first_cards, second_cards, trump, tree_table)

def mk_tree_score_only(first_cards, second_cards, trump, tree_table):
    return play_card_score_only(first_cards, second_cards, trump, tree_table)
    
def get_key_map(first_cards, second_cards,trump):
    gc = get_concat(first_cards, second_cards)
    key, concat_map = get_keyandmap(gc[0], gc[1])
    key.append(trump)
    return tuple(key), concat_map