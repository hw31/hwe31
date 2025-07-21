const getErrorMessage = (error, defaultMsg = "Error inesperado") => {
  const data = error?.response?.data;

  return (
    data?.mensaje ||
    data?.Mensaje ||
    data?.message ||
    data?.Message ||
    data?.error ||
    data?.Error ||
    defaultMsg
  );
};

export default getErrorMessage;