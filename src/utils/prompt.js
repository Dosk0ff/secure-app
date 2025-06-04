export const ask = (rl, questionText) => {
    return new Promise((resolve) => {
        rl.question(questionText, (answer) => resolve(answer));
    });
};
