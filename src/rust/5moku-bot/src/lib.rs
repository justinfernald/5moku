use js_sys::Uint8Array;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub struct GomokuBot {
    depth: i32,
}

#[wasm_bindgen]
impl GomokuBot {
    #[wasm_bindgen(constructor)]
    pub fn new(depth: i32) -> Self {
        GomokuBot { depth }
    }

    #[wasm_bindgen]
    pub fn best_move(&self, board: Uint8Array, player: u8) -> Box<[i32]> {
        let board = board.to_vec();
        let (score, x, y) = self.minimax(&board, self.depth, i32::MIN, i32::MAX, player == 1);
        Box::new([x as i32, y as i32, score])
    }

    fn minimax(
        &self,
        board: &Vec<u8>,
        depth: i32,
        mut alpha: i32,
        mut beta: i32,
        is_maximizing: bool,
    ) -> (i32, usize, usize) {
        if depth == 0 || self.is_game_over(board) {
            return (self.evaluate_board(board), 0, 0);
        }

        let mut best_score = if is_maximizing { i32::MIN } else { i32::MAX };
        let mut best_move = (0, 0);

        for y in 0..15 {
            for x in 0..15 {
                if board[y * 15 + x] == 0 {
                    let mut new_board = board.clone();
                    new_board[y * 15 + x] = if is_maximizing { 1 } else { 2 };

                    let (score, _, _) =
                        self.minimax(&new_board, depth - 1, alpha, beta, !is_maximizing);

                    if is_maximizing {
                        if score > best_score {
                            best_score = score;
                            best_move = (x, y);
                        }
                        alpha = alpha.max(best_score);
                    } else {
                        if score < best_score {
                            best_score = score;
                            best_move = (x, y);
                        }
                        beta = beta.min(best_score);
                    }

                    if beta <= alpha {
                        break;
                    }
                }
            }
        }

        (best_score, best_move.0, best_move.1)
    }

    fn is_game_over(&self, board: &Vec<u8>) -> bool {
        // Check for a win or if the board is full
        self.check_win(board, 1) || self.check_win(board, 2) || !board.contains(&0)
    }

    fn check_win(&self, board: &Vec<u8>, player: u8) -> bool {
        // Check horizontally, vertically, and diagonally for 5 in a row
        for y in 0..15 {
            for x in 0..15 {
                if x + 4 < 15 && (0..5).all(|i| board[(y * 15 + x + i) as usize] == player) {
                    return true;
                }
                if y + 4 < 15 && (0..5).all(|i| board[((y + i) * 15 + x) as usize] == player) {
                    return true;
                }
                if x + 4 < 15
                    && y + 4 < 15
                    && (0..5).all(|i| board[((y + i) * 15 + x + i) as usize] == player)
                {
                    return true;
                }
                if x >= 4
                    && y + 4 < 15
                    && (0..5).all(|i| board[((y + i) * 15 + x - i) as usize] == player)
                {
                    return true;
                }
            }
        }
        false
    }

    fn evaluate_board(&self, board: &Vec<u8>) -> i32 {
        let player_score = self.evaluate_player(board, 1);
        let opponent_score = self.evaluate_player(board, 2);
        player_score - opponent_score
    }

    fn evaluate_player(&self, board: &Vec<u8>, player: u8) -> i32 {
        let mut score = 0;
        let directions = [(1, 0), (0, 1), (1, 1), (1, -1)];

        for y in 0..15 {
            for x in 0..15 {
                for &(dx, dy) in &directions {
                    score += self.evaluate_line(board, x, y, dx, dy, player);
                }
            }
        }

        score
    }

    fn evaluate_line(
        &self,
        board: &Vec<u8>,
        x: usize,
        y: usize,
        dx: i32,
        dy: i32,
        player: u8,
    ) -> i32 {
        let mut count = 0;
        let mut open_ends = 0;

        for i in 0..6 {
            let nx = x as i32 + i * dx;
            let ny = y as i32 + i * dy;

            if nx < 0 || nx >= 15 || ny < 0 || ny >= 15 {
                break;
            }

            let cell = board[(ny * 15 + nx) as usize];
            if cell == player {
                count += 1;
            } else if cell == 0 {
                open_ends += 1;
                break;
            } else {
                break;
            }
        }

        for i in 1..6 {
            let nx = x as i32 - i * dx;
            let ny = y as i32 - i * dy;

            if nx < 0 || nx >= 15 || ny < 0 || ny >= 15 {
                break;
            }

            let cell = board[(ny * 15 + nx) as usize];
            if cell == player {
                count += 1;
            } else if cell == 0 {
                open_ends += 1;
                break;
            } else {
                break;
            }
        }

        match (count, open_ends) {
            (5, _) => 1000000, // Win
            (4, 2) => 100000,  // Open four
            (4, 1) => 10000,   // Closed four
            (3, 2) => 1000,    // Open three
            (3, 1) => 100,     // Closed three
            (2, 2) => 100,     // Open two
            (2, 1) => 10,      // Closed two
            (1, _) => 1,
            _ => 0,
        }
    }
}
