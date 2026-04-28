import * as yup from 'yup'

yup.setLocale({
  mixed: {
    required: () => ({ key: 'required' }),
    notOneOf: () => ({ key: 'notOneOf' }),
  },
  string: {
    url: () => ({ key: 'url' }),
  },
})

const createSchema = urls => yup.string()
  .required()
  .url()
  .notOneOf(urls)

export default createSchema
