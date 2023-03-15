from make_tree import make_tree as mt
from BaseBot import BaseBot

class NewTreeBOT(BaseBot): 
    def play(self, oppo_play=-1):
       
        self.opponent_hand.sort()
        self.my_hand.sort()  
        #先手
        if oppo_play == -1:
            
            #concat_map 是雙向的字典，可以從index對應到card，也可以從card對應到index，但是index對應到card時key要加100
            #而index代表的是該牌在雙方所有手牌中由小到大的排序
            key, concat_map = mt.get_key_map(self.my_hand, self.opponent_hand, self.trump)
            if key not in self.tree_table.keys():
                mt.mk_tree(self.my_hand, self.opponent_hand, self.trump, self.tree_table)
            
            my_play = concat_map[self.tree_table[key][2]+100]
        #後手
        else:
            
            key, concat_map = mt.get_key_map(self.opponent_hand, self.my_hand, self.trump)
            if key not in self.tree_table.keys():
                mt.mk_tree(self.opponent_hand, self.my_hand, self.trump, self.tree_table)
            
            my_play = concat_map[self.tree_table[key][3][concat_map[oppo_play]]+100]
        
        self.opponent_hand.remove(oppo_play)
        self.my_hand.remove(my_play)
        
        return my_play  
