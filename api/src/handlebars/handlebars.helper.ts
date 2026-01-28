import Handlebars from 'handlebars';

export const handlebarsHelper = () => {
  Handlebars.registerHelper('eq', function (a: string, b: string, opts) {
    if (a === b) {
      return opts.fn(this);
    } else {
      return opts.inverse(this);
    }
  });
};
