let arraymove = (arr, fromIndex, toIndex) => {
    var element = arr[fromIndex];
    arr.splice(fromIndex, 1);
    arr.splice(toIndex, 0, element);
};
let next_round = (pre_tree) => {
    if (pre_tree.g.length === 1) {
        return pre_tree;
    }
    let tree = {
        g: [],
    };
    if (pre_tree.g.length % 2) {
        let pre_node_count = 0;
        for (let i = 0; i < pre_tree.g.length; i += 1) {
            pre_node_count += pre_tree.g[i].g.length;
        }
        let seed = -1
        if (pre_node_count % 2) {
            seed = Math.floor(Math.random() * (pre_tree.g.length - 1));
        } else {
            seed = Math.floor(Math.random() * pre_tree.g.length);
        }
        arraymove(pre_tree.g, seed, pre_tree.g.length - 1);
        for (let i = 0; i < pre_tree.g.length - 1; i += 2) {
            tree.g.push({ g: [pre_tree.g[i], pre_tree.g[i + 1]] });
        }
        tree.g.push({ g: [pre_tree.g[pre_tree.g.length - 1]] });
    } else {
        for (let i = 0; i < pre_tree.g.length; i += 2) {
            tree.g.push({ g: [pre_tree.g[i], pre_tree.g[i + 1]] });
        }
    }
    return tree;
};

module.exports = {
    next_round: next_round
}