// 找出最大的岛屿
function findMaxIslandArea(arr) {
    let maxArea = 0;
    for (let i = 0; i < arr.length; i++) {
        let row = arr[i];
        for (let j = 0; j < row.length; j++) {
            let el = row[j];
            if (el === 1) {
                let num = computeIslandArea(i, j, arr);
                console.log(`岛屿[${i},${j}]，面积为${num}`);
                if (num > maxArea) {
                    maxArea = num;
                }
            }
        }
    }
    return maxArea;
}

// 计算岛屿大小 x是行 y是列
function computeIslandArea(x, y, grid, count = 0) {
    if (x < 0 || y < 0) return 0;
    if (grid[x] && (grid[x][y] == 1)) {
        // 已计算过的标记为0
        grid[x][y] = 0;
        count++;
        // 计算左边
        count += computeIslandArea(x, y - 1, grid);
        // 计算右边
        count += computeIslandArea(x, y + 1, grid);
        // 计算上面
        count += computeIslandArea(x - 1, y, grid);
        // 计算下面
        count += computeIslandArea(x + 1, y, grid);
    }
    return count;
}

let grids = [
    [0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0],
    [0, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 1, 0, 0, 1, 1, 0, 0, 1, 0, 1, 0, 0],
    [0, 1, 0, 0, 1, 1, 0, 0, 1, 1, 1, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0]
];

console.log(`最大岛屿面积为：${findMaxIslandArea(grids)}`);