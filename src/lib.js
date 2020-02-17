export const appendH2DOM = text => {
  const h2 = document.createElement("h2");
  h2.innerText = text;
  document.body.append(h2);
};
