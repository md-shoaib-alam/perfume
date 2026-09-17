import * as React from "react";
import type { ToastProps } from "./toast";

const TOAST_LIMIT = 3;
const TOAST_REMOVE_DELAY = 400;

export type ToasterToast = ToastProps & {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
};

const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
} as const;

let count = 0;

function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER;
  return count.toString();
}

type ActionType = typeof actionTypes;

type Action =
  | {
      type: ActionType["ADD_TOAST"];
      toast: ToasterToast;
    }
  | {
      type: ActionType["UPDATE_TOAST"];
      toast: Partial<ToasterToast>;
    }
  | {
      type: ActionType["DISMISS_TOAST"];
      toastId?: string;
    }
  | {
      type: ActionType["REMOVE_TOAST"];
      toastId?: string;
    };

interface State {
  toasts: ToasterToast[];
}

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>();

const addToRemoveQueue = (toastId: string) => {
  if (toastTimeouts.has(toastId)) {
    return;
  }

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId);
    dispatch({
      type: "REMOVE_TOAST",
      toastId: toastId,
    });
  }, TOAST_REMOVE_DELAY);

  toastTimeouts.set(toastId, timeout);
};

export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "ADD_TOAST": {
      // Deduplicate: If an active toast with the same title & description is already open,
      // refresh it instead of stacking a duplicate toast card
      const existingToastIndex = state.toasts.findIndex(
        (t) => t.open && t.title === action.toast.title && t.description === action.toast.description
      );

      if (existingToastIndex > -1) {
        const updated = [...state.toasts];
        updated[existingToastIndex] = {
          ...updated[existingToastIndex],
          ...action.toast,
          id: updated[existingToastIndex].id,
          open: true,
        };
        return {
          ...state,
          toasts: updated,
        };
      }

      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      };
    }

    case "UPDATE_TOAST":
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      };

    case "DISMISS_TOAST": {
      const { toastId } = action;

      if (toastId) {
        addToRemoveQueue(toastId);
      } else {
        state.toasts.forEach((toast) => {
          addToRemoveQueue(toast.id);
        });
      }

      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId || toastId === undefined
            ? {
                ...t,
                open: false,
              }
            : t
        ),
      };
    }
    case "REMOVE_TOAST":
      if (action.toastId === undefined) {
        return {
          ...state,
          toasts: [],
        };
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      };
  }
};

const listeners: Array<(state: State) => void> = [];

let memoryState: State = { toasts: [] };

function dispatch(action: Action) {
  memoryState = reducer(memoryState, action);
  listeners.forEach((listener) => {
    listener(memoryState);
  });
}

type ToastInput = Omit<ToasterToast, "id"> | string;

function parseToastInput(input: ToastInput, defaultVariant?: ToasterToast["variant"]): Omit<ToasterToast, "id"> {
  if (typeof input === "string") {
    return {
      title: input,
      variant: defaultVariant || "default",
    };
  }
  return {
    ...input,
    variant: input.variant || defaultVariant || "default",
  };
}

function toast(props: ToastInput) {
  const id = genId();
  const parsed = parseToastInput(props);
  const duration = parsed.duration !== undefined ? parsed.duration : 2200;

  const update = (props: ToasterToast) =>
    dispatch({
      type: "UPDATE_TOAST",
      toast: { ...props, id },
    });
  const dismiss = () => dispatch({ type: "DISMISS_TOAST", toastId: id });

  dispatch({
    type: "ADD_TOAST",
    toast: {
      ...parsed,
      id,
      duration,
      open: true,
      onOpenChange: (open) => {
        if (!open) dismiss();
      },
      onClose: () => {
        dismiss();
      },
    },
  });

  return {
    id: id,
    dismiss,
    update,
  };
}

toast.success = (props: ToastInput) => {
  return toast(parseToastInput(props, "success"));
};

toast.destructive = (props: ToastInput) => {
  return toast(parseToastInput(props, "destructive"));
};

toast.error = (props: ToastInput) => {
  return toast(parseToastInput(props, "destructive"));
};

toast.warning = (props: ToastInput) => {
  return toast(parseToastInput(props, "warning"));
};

toast.info = (props: ToastInput) => {
  return toast(parseToastInput(props, "info"));
};

toast.loading = (props: ToastInput) => {
  return toast(parseToastInput(props, "loading"));
};

toast.promise = <T,>(
  promise: Promise<T>,
  data: {
    loading: ToastInput;
    success: ((result: T) => ToastInput) | ToastInput;
    error: ((err: any) => ToastInput) | ToastInput;
  }
) => {
  const { id, dismiss, update } = toast(parseToastInput(data.loading, "loading"));

  promise
    .then((result) => {
      const successData =
        typeof data.success === "function" ? data.success(result) : data.success;
      update({
        id,
        ...parseToastInput(successData, "success"),
        open: true,
      });
    })
    .catch((err) => {
      const errorData =
        typeof data.error === "function" ? data.error(err) : data.error;
      update({
        id,
        ...parseToastInput(errorData, "destructive"),
        open: true,
      });
    });

  return { id, dismiss };
};

toast.dismiss = (toastId?: string) => {
  dispatch({ type: "DISMISS_TOAST", toastId });
};

function useToast() {
  const [state, setState] = React.useState<State>(memoryState);

  React.useEffect(() => {
    listeners.push(setState);
    return () => {
      const index = listeners.indexOf(setState);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }, [state]);

  return {
    ...state,
    toast,
    dismiss: (toastId?: string) => dispatch({ type: "DISMISS_TOAST", toastId }),
  };
}

export { useToast, toast };
