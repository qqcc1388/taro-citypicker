// module.exports = {
//   "extends": ["taro/react"],
//   "rules": {
//     "react/jsx-uses-react": "off",
//     "react/react-in-jsx-scope": "off"
//   }
// }
{
  "extends": ["taro/react"],
  "rules": {
    "react/jsx-uses-react": "off",
    "react/react-in-jsx-scope": "off",
    "react/jsx-boolean-value": "off",
    "react/no-unused-state": "off",
    "no-unused-vars": ["off", { "varsIgnorePattern": "Taro" }],
    "no-shadow": "off",
    "@typescript-eslint/no-shadow": ["error"],
    // "no-unused-vars": "off",
    // "@typescript-eslint/no-unused-vars": "off",
    "react/jsx-filename-extension": [
      1,
      { "extensions": [".js", ".jsx", ".tsx"] }
    ],
    // "jsx-quotes": ["error", "prefer-double"]
    "jsx-quotes": "off"
  },
  "parser": "babel-eslint",
  "parserOptions": {
    "ecmaVersion": 2018,
    "ecmaFeatures": {
      "experimentalObjectRestSpread": true,
      "experimentalDecorators": true,
      "jsx": true
    },
    "sourceType": "module"
  }
}

