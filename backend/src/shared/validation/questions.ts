import Joi from 'joi';

export const optionSchema = Joi.object({
  label: Joi.string().min(1).required(),
  is_correct: Joi.boolean().required(),
});

export const questionSchema = Joi.object({
  prompt: Joi.string().min(1).required(),
  type: Joi.string().optional().default('multiple_choice'),
  options: Joi.array().items(optionSchema).min(1).required(),
}).custom((value, helpers) => {
  // Ensure at least one correct option
  const hasCorrect = value.options.some((o: any) => o.is_correct === true);
  if (!hasCorrect) return helpers.error('question.missingCorrect');
  return value;
}).messages({ 'question.missingCorrect': 'Each question must have at least one correct option' });

export const bulkQuestionsSchema = Joi.array().items(questionSchema).min(1);
