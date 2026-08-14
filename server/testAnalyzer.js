const path = require("path");

const {
    analyzeRepository
} = require("./services/repositoryAnalyzer");

const projectPath = path.join(
    __dirname,
    ".."
);

const result = analyzeRepository(projectPath);

console.log("Repository Analysis:");
console.log(result);