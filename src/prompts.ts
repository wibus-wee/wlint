import prompts from "prompts";
import { blue } from "kolorist";
import { promptsOnCancel } from "./error";

export interface BaseProps {
  message: string;
  initial?: any;
}

export type ConfirmProps = BaseProps;

export const promptsOptions: prompts.Options = {
  onCancel: promptsOnCancel,
};

export async function confirm(optsRaw: ConfirmProps | string) {
  let opts: ConfirmProps;
  if (typeof optsRaw === "string") {
    opts = { message: optsRaw };
  } else {
    opts = optsRaw;
  }
  const { message, initial = true } = opts;
  return (
    await prompts(
      {
        type: "confirm",
        name: "result",
        message: `${blue("✖")} ${message}`,
        initial,
      },
      promptsOptions
    )
  ).result as boolean;
}

export type SelectProps = BaseProps & {
  choices: Array<
    | string
    | {
        title: string;
        value: string;
      }
  >;
  multiselect?: boolean;
};

export async function select(optsRaw: SelectProps) {
  const opts: prompts.PromptObject = {
    name: "result",
    type: optsRaw.multiselect ? "multiselect" : "select",
    choices: [] as Array<prompts.Choice>,
  };
  optsRaw.choices.forEach((choice) => {
    if (typeof choice === "string") {
      (opts.choices as Array<prompts.Choice>).push({
        title: choice,
        value: choice,
      });
    } else {
      (opts.choices as Array<prompts.Choice>).push(choice);
    }
  });
  return (await prompts(opts, promptsOptions)).result;
}

export type TextOptions = BaseProps & {
  initial?: string;
};

export async function text(optsRaw: TextOptions | string) {
  const opts: prompts.PromptObject = {
    type: "text",
    name: "result",
  };
  if (typeof optsRaw === "string") {
    opts.message = optsRaw;
  } else {
    const { message, initial } = optsRaw;
    opts.message = message;
    opts.initial = initial;
  }
  return (await prompts(opts, promptsOptions)).result as string;
}
