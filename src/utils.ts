const extractPhrases =
  /<phrase>([\w:+*&€@#!?;,.`'\-ÀÁÂÃÄÅàáâãäåÈÉÊËèéêëÒÓÔÖòóôöÌÍÎÏìíîïÙÚÛÜùúûüçșț ]*)<\/phrase>/gm;

export const noHtml = (s: string) =>
  s
    .replace(/&amp;/gi, '&')
    .replace(/&gt;/gi, '>')
    .replace(/&lt;/gi, '<')
    .replace(/<br\s*\/?>|&nbsp;|\s+/gi, ' ');

export const isOK = /\s*ja\s*/i;

export const toUrl = (url: string) => {
  extractPhrases.lastIndex = 0;
  const m = extractPhrases.exec(url);
  const u = m ? m[1] : url;
  const match = /href=\\?"([\w?&=\/;:\-.,%]*)\\?"/gim.exec(u);
  return match ? match[1].replace(/&amp;/g, '&') : u;
};

export const toNumber = (s: string) => {
  const m = /(\d*)/i.exec(s);
  return m ? +m[1] : +s;
};
