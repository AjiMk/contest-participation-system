import Joi from 'joi';

export const optionSchema = Joi.object({
  label: Joi.string().min(1).required(),
  is_correct: Joi.boolean().required(),
});

export const questionSchema = Joi.object({
  prompt: Joi.string().min(1).required(),
  type: Joi.string().valid('single', 'multi', 'boolean').optional().default('single'),
  options: Joi.array().items(optionSchema).min(1).required(),
}).custom((value, helpers) => {
  if (value.type === 'boolean') {
    if (!Array.isArray(value.options) || value.options.length !== 2) {
      return helpers.error('question.booleanTwoOptions');
    }
    const correctCount = value.options.filter((o: any) => o.is_correct === true).length;
    if (correctCount !== 1) return helpers.error('question.booleanOneCorrect');
    return value;
  }
  // For single/multi: ensure at least one correct
  const hasCorrect = value.options.some((o: any) => o.is_correct === true);
  if (!hasCorrect) return helpers.error('question.missingCorrect');
  return value;
}).messages({
  'question.missingCorrect': 'Each question must have at least one correct option',
  'question.booleanTwoOptions': 'Boolean questions must have exactly two options',
  'question.booleanOneCorrect': 'Boolean questions must have exactly one correct option',
});

export const bulkQuestionsSchema = Joi.array().items(questionSchema).min(1);
