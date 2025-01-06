const status = import.meta.env.VITE_LOGGER_SWITCH

function info(message: any) {
  if (!status)
    return
  console.log(`🌲 %c[info] %c${message}`, 'color: #8b5cf6', 'color: #d1d5db')
}

function error(message: any) {
  if (!status)
    return
  console.log(`🌲 %c[error] %c${typeof message === 'object' ? JSON.stringify(message) : message}`, 'color: #dc2626', 'color: #d1d5db')
}

function warn(message: any) {
  if (!status)
    return
  console.log(`🌲 %c[warn] %c${typeof message === 'object' ? JSON.stringify(message) : message}`, 'color: #ea580c', 'color: #d1d5db')
}

function success(message: any) {
  if (!status)
    return
  console.log(`🌲 %c[success] %c${message}`, 'color: #16a34a', 'color: #d1d5db')
}

function setting(title: string, message: any) {
  if (!status)
    return
  console.log(`🔩 %c[${title}] %c${typeof message === 'object' ? JSON.stringify(message) : message}`, 'color: #22d3ee', 'color: #d1d5db')
}

export default {
  info,
  error,
  warn,
  success,
  setting,
}
