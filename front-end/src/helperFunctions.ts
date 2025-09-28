const authenticationFailed = () => {
    alert(`Your session has expired, please login again`);
    localStorage.clear();
    window.location.href = './login';
};

export default authenticationFailed;