use wasm_bindgen::prelude::*;

// ! INITIAL EXAMPLE - START
// mod utils;
// #[wasm_bindgen]
// extern "C" {
//     fn alert(s: &str);
// }

// #[wasm_bindgen]
// pub fn greet() {
//     alert("Hello, 5moku-bot!");
// }
// ! END

#[wasm_bindgen]
pub struct GomokuBot {
    size: usize,
    depth: usize,
}

#[wasm_bindgen]
impl GomokuBot {
    #[wasm_bindgen(constructor)]
    pub fn new(size: usize, depth: usize) -> GomokuBot {
        GomokuBot { size, depth }
    }

    pub fn best_move(&self, board: &[u8], player: u8) -> Option<usize> {
        let board_2d = self.convert_to_2d(board);
        let mut best_score = i32::MIN;
        let mut best_move = None;

        for x in 0..self.size {
            for y in 0..self.size {
                if board_2d[x][y] == 0 {
                    let mut board_clone = board_2d.clone();
                    board_clone[x][y] = player;
                    let score = self.alpha_beta(board_clone, 0, i32::MIN, i32::MAX, false, player);
                    if score > best_score {
                        best_score = score;
                        best_move = Some(x * self.size + y);
                    }
                }
            }
        }

        best_move
    }

    fn alpha_beta(
        &self,
        board: Vec<Vec<u8>>,
        depth: usize,
        mut alpha: i32,
        mut beta: i32,
        maximizing: bool,
        player: u8,
    ) -> i32 {
        if self.is_winner(&board, player) {
            return if maximizing {
                100 - depth as i32
            } else {
                depth as i32 - 100
            };
        } else if self.is_draw(&board) || depth >= self.depth {
            return 0;
        }

        let mut best_score = if maximizing { i32::MIN } else { i32::MAX };

        for x in 0..self.size {
            for y in 0..self.size {
                if board[x][y] == 0 {
                    let mut board_clone = board.clone();
                    board_clone[x][y] = if maximizing { player } else { 3 - player }; // Toggle between player 1 and 2
                    let score =
                        self.alpha_beta(board_clone, depth + 1, alpha, beta, !maximizing, player);

                    if maximizing {
                        best_score = best_score.max(score);
                        alpha = alpha.max(score);
                    } else {
                        best_score = best_score.min(score);
                        beta = beta.min(score);
                    }

                    if beta <= alpha {
                        break;
                    }
                }
            }
        }

        best_score
    }

    fn is_winner(&self, board: &Vec<Vec<u8>>, player: u8) -> bool {
        for x in 0..self.size {
            for y in 0..self.size {
                if x <= self.size - 5 {
                    if (0..5).all(|i| board[x + i][y] == player) {
                        return true;
                    }
                }
                if y <= self.size - 5 {
                    if (0..5).all(|i| board[x][y + i] == player) {
                        return true;
                    }
                }
                if x <= self.size - 5 && y <= self.size - 5 {
                    if (0..5).all(|i| board[x + i][y + i] == player) {
                        return true;
                    }
                }
                if x >= 4 && y <= self.size - 5 {
                    if (0..5).all(|i| board[x - i][y + i] == player) {
                        return true;
                    }
                }
            }
        }
        false
    }

    fn is_draw(&self, board: &Vec<Vec<u8>>) -> bool {
        for row in board.iter() {
            if row.iter().any(|&cell| cell == 0) {
                return false;
            }
        }
        true
    }

    fn convert_to_2d(&self, board: &[u8]) -> Vec<Vec<u8>> {
        let mut board_2d = vec![vec![0; self.size]; self.size];
        for (i, &val) in board.iter().enumerate() {
            board_2d[i / self.size][i % self.size] = val;
        }
        board_2d
    }
}
