class GoBang {
  constructor(x, y, chessId) {
    // 坐标
    this.x = Number(x)
    this.y = Number(y)

    // canvas, chessboard, winmethod
    this.chessId = chessId
    this.context = this.PrintCanvasChessBoard()
    this.chessBoard = this.CreateChessBoard()
    this.winMethod = this.CreateWinMethod()

    // 设置落子者
    // 该属性将会在落子后改变
    this.nowSetter = this.GoToNextSetter()

    // 落子顺序数组和悔棋数组
    this.setOrder = []
    this.setRetract = []

    // lock
    // 该属性将会在出现胜者后改变
    this.lock = false
  }

  PrintCanvasChessBoard(
    x = this.x,
    y = this.y,
    chessId = this.chessId,
  ) {
    // 画一个棋盘
    // 返回画布对象
    const chess = document.querySelector(chessId)
    chess.width = x * 30
    chess.height = y * 30
    const context = chess.getContext('2d')
    context.clearRect(0, 0, chess.width, chess.height)
    context.strokeStyle = '#000'
    context.lineWidth = 2
    context.beginPath()

    for (let i = 0; i < x; i += 1) {
      context.moveTo(15 + i * 30, 15)
      context.lineTo(15 + i * 30, (y - 1) * 30 + 15)
      context.stroke()
      context.moveTo(15, 15 + i * 30)
      context.lineTo((y - 1) * 30 + 15, 15 + i * 30)
      context.stroke()
    }

    context.closePath()

    return context
  }

  PrintCanvasPoint(
    x,
    y,
    setter = this.nowSetter,
    context = this.context,
  ) {
    // 画一个落子
    context.beginPath()
    context.arc(
      15 + x * 30,
      15 + y * 30,
      13,
      0,
      2 * Math.PI,
    )

    const gradient = context
      .createRadialGradient(
        15 + x * 30 + 2,
        15 + y * 30 - 2,
        13,
        15 + x * 30 + 2,
        15 + y * 30 - 2,
        0,
      )

    if (setter === 'black') {
      gradient.addColorStop(0, '#0A0A0A')
      gradient.addColorStop(1, '#636766')
    } else {
      gradient.addColorStop(0, '#D1D1D1')
      gradient.addColorStop(1, '#F9F9F9')
    }
    context.fillStyle = gradient
    context.fill()
    context.closePath()
  }

  PrintCanvasNoPoint(
    x,
    y,
    context = this.context,
  ) {
    // 清空一个落子
    // 用于悔棋
    context.clearRect(x * 30, y * 30, 30, 30)
    context.beginPath()
    context.strokeStyle = '#000'
    context.moveTo(
      (x === 0 ? 0.5 : x) * 30,
      15 + y * 30,
    )
    context.lineTo(
      (x === this.x - 1 ? x + 0.5 : x + 1) * 30,
      15 + y * 30,
    )
    context.stroke()
    context.moveTo(
      15 + x * 30,
      (y === 0 ? 0.5 : y) * 30,
    )
    context.lineTo(
      15 + x * 30,
      (y === this.y - 1 ? y + 0.5 : y + 1) * 30,
    )
    context.stroke()
    context.closePath()
  }

  CreatePoint(
    x = this.x,
    y = this.y,
  ) {
    // 生成一个点对象
    // 返回包含横纵坐标，落子者，撤销落子者
    // 和该点涉及的key为方法序号的获胜方法对象
    return {
      x, y, setter: null, reSetter: null, winMethod: {},
    }
  }

  CreateChessBoard(
    x = this.x,
    y = this.y,
  ) {
    // 生成一个棋盘对象
    // 返回包含每个key为x${i}y${j}的点对象
    const chessBoard = {}

    for (let i = 0; i < x; i += 1) {
      for (let j = 0; j < y; j += 1) {
        chessBoard[`x${i}y${j}`] = this.CreatePoint(i, j)
      }
    }

    return chessBoard
  }

  CreateWinMethod(
    x = this.x,
    y = this.y,
    chessBoard = this.chessBoard,
  ) {
    // 生成一个获胜方法数组
    // 返回包含每个获胜方法对象
    const winMethod = []

    // 方法序号
    let count = 0

    // 横线赢法
    for (let i = 0; i < x; i += 1) {
      for (let j = 0; j < y - 4; j += 1) {
        winMethod.push([])
        for (let k = 0; k < 5; k += 1) {
          winMethod[count]
            .push(chessBoard[`x${i}y${j + k}`])
          if (!chessBoard[`x${i}y${j + k}`].winMethod[count]) {
            chessBoard[`x${i}y${j + k}`]
              .winMethod[count] = winMethod[count]
          }
        }
        count += 1
      }
    }

    // 竖线赢法
    for (let i = 0; i < y; i += 1) {
      for (let j = 0; j < x - 4; j += 1) {
        winMethod.push([])
        for (let k = 0; k < 5; k += 1) {
          winMethod[count]
            .push(chessBoard[`x${j + k}y${i}`])
          if (!chessBoard[`x${j + k}y${i}`].winMethod[count]) {
            chessBoard[`x${j + k}y${i}`]
              .winMethod[count] = winMethod[count]
          }
        }
        count += 1
      }
    }

    // 斜线赢法
    for (let i = 0; i < x - 4; i += 1) {
      for (let j = 0; j < y - 4; j += 1) {
        winMethod.push([])
        for (let k = 0; k < 5; k += 1) {
          winMethod[count]
            .push(chessBoard[`x${i + k}y${j + k}`])
          if (!chessBoard[`x${i + k}y${j + k}`].winMethod[count]) {
            chessBoard[`x${i + k}y${j + k}`]
              .winMethod[count] = winMethod[count]
          }
        }
        count += 1
      }
    }

    // 反斜线赢法
    for (let i = 0; i < x - 4; i += 1) {
      for (let j = y - 1; j > 3; j -= 1) {
        winMethod.push([])
        for (let k = 0; k < 5; k += 1) {
          winMethod[count]
            .push(chessBoard[`x${i + k}y${j - k}`])
          if (!chessBoard[`x${i + k}y${j - k}`].winMethod[count]) {
            chessBoard[`x${i + k}y${j - k}`]
              .winMethod[count] = winMethod[count]
          }
        }
        count += 1
      }
    }

    return winMethod
  }

  CheckWinMethod(
    method,
  ) {
    // 检查该方法是否能够获胜
    // 返回该方法获胜机会数字：
    // -1 为无机会
    // 0-4 为根据落子的机会等级
    // 5 为直接获胜
    // 此处可拓展敌我分析的算法
    const setterOne = method.find(point => point.setter)
    if (!setterOne) return 0

    const setterNotOnly = method.find(point => (
      point.setter
        && point.setter !== setterOne.setter
    ))

    if (setterNotOnly) return -1

    return method.reduce((times, point) => (
      point.setter ? (times + 1) : times
    ), 0)
  }

  FindNextPointToWin(
    chessBoard = this.chessBoard,
  ) {
    // 遍历所有的点，找出赢法最多的点
    // 返回包含点坐标及该点可赢的机会累加量对象
    // 缓存赢法机会计算，不重复计算
    const cacheMethodWinChance = {}

    return Object.values(chessBoard)
      .reduce((mostWinPoint, point) => {
        if (point.setter) return mostWinPoint

        // 计算点的赢法统计
        const pointCanWinChance = Object.keys(point.winMethod)
          .reduce((canWinChance, methodKey) => {
            if (!cacheMethodWinChance[methodKey]) {
              cacheMethodWinChance[methodKey] = this
                .CheckWinMethod(point.winMethod[methodKey])
            }

            if (cacheMethodWinChance[methodKey] !== -1) {
              canWinChance[cacheMethodWinChance[methodKey]] += 1
            }

            return canWinChance
          }, {
            0: 0, 1: 0, 2: 0, 3: 0, 4: 0,
          })

        // 比较赢法，取最容易赢的为大
        // 此处可拓展更加职能的赢面比较算法
        for (let i = 4; i > 0; i -= 1) {
          if (pointCanWinChance[i] > mostWinPoint.pointCanWinChance[i]) {
            return { x: point.x, y: point.y, pointCanWinChance }
          } if (pointCanWinChance[i] < mostWinPoint.pointCanWinChance[i]) {
            return mostWinPoint
          }
        }

        return mostWinPoint
      }, {
        x: 0,
        y: 0,
        pointCanWinChance: {
          0: 0, 1: 0, 2: 0, 3: 0, 4: 0,
        },
      })
  }

  CheckSetterPointIsWin(
    x,
    y,
    setter = this.nowSetter,
    chessBoard = this.chessBoard,
  ) {
    // 检查落子后该点是否获胜
    return Object
      .values(chessBoard[`x${x}y${y}`].winMethod)
      .find(method => method
        .every(point => point.setter === setter))
  }

  checkChessBoardIsNoPlce(
    chessBoard = this.chessBoard,
  ) {
    // 返回棋盘是否有没落子的地方
    return !Object.values(chessBoard)
      .find(point => !point.setter)
  }

  GoToNextSetter(
    setter = this.nowSetter,
  ) {
    // 返回下一个落子者字符串
    if (setter === 'black') return 'white'
    return 'black'
  }

  GoSetPoint(
    x,
    y,
    setter = this.nowSetter,
    chessBoard = this.chessBoard,
  ) {
    // 落子方法
    // 返回是否落子成功
    if (this.lock) return false

    // 执行数据变化和落子
    const point = chessBoard[`x${x}y${y}`]
    if (point.setter) {
      setTimeout(() => {
        alert(
          `${
            point.setter
          }已经落子，(${x}, ${y})`,
        )
      }, 0)
      return false
    }

    // 落子，并放入落子数组，清空悔棋数组
    point.setter = setter
    point.reSetter = null
    this.setOrder.push(point)
    if (this.setRetract.length) this.setRetract = []

    // 画子
    this.PrintCanvasPoint(x, y)

    // 检查是否赢了，赢了设置锁定盘局
    const setterIsWin = this.CheckSetterPointIsWin(x, y)
    if (setterIsWin) {
      this.lock = true
      setTimeout(() => {
        alert(
          `${setter} 获胜 !!`,
        )
      }, 0)

      return false
    }

    // 检查是否没有落子的地方
    const isNoPlce = this.checkChessBoardIsNoPlce()
    if (isNoPlce) {
      this.lock = true
      setTimeout(() => {
        alert(
          '没地方下啦，和局 !!',
        )
      }, 0)

      return false
    }

    // 设置下一个落子者
    this.nowSetter = this.GoToNextSetter()

    return true
  }

  GoSetPointClickTrans(
    x,
    y,
  ) {
    // 鼠标事件位置转化
    // 返回落子方法
    return this.GoSetPoint(
      Math.floor(x / 30),
      Math.floor(y / 30),
    )
  }

  GoComputerAI(
  ) {
    // AI落子方法
    // 找到下一个towin然后执行落子
    // AI必然能落子成功因此无需判断返回
    if (this.lock) return

    const point = this.FindNextPointToWin()
    this.GoSetPoint(point.x, point.y)
  }

  GoRetractPoint(
    setOrder = this.setOrder,
    setRetract = this.setRetract,
  ) {
    // 悔棋方法
    // 取出最后一、 二次落子
    if (this.lock) return

    if (!setOrder.length) {
      setTimeout(() => {
        alert(
          '请先下棋 !!',
        )
      }, 0)
      return
    }

    const length = setOrder.length >= 2 ? 2 : 1
    if (length === 1) {
      this.nowSetter = this.GoToNextSetter()
    }
    for (let i = 0; i < length; i += 1) {
      const lastSet = setOrder.pop()
      lastSet.reSetter = lastSet.setter
      lastSet.setter = null
      setRetract.push(lastSet)

      this.PrintCanvasNoPoint(lastSet.x, lastSet.y)
    }
  }

  GoReDoSetPoint(
    setOrder = this.setOrder,
    setRetract = this.setRetract,
  ) {
    // 重做已悔棋方法
    // 取出最后一、 二次落子
    if (this.lock) return

    if (!setRetract.length) {
      setTimeout(() => {
        alert(
          '没有可撤销的悔棋 !!',
        )
      }, 0)
      return
    }

    const length = setRetract.length >= 2 ? 2 : 1
    if (length === 1) {
      this.nowSetter = this.GoToNextSetter()
    }
    for (let i = 0; i < length; i += 1) {
      const lastSet = setRetract.pop()
      lastSet.setter = lastSet.reSetter
      lastSet.reSetter = null
      setOrder.push(lastSet)

      this.PrintCanvasPoint(lastSet.x, lastSet.y, lastSet.setter)
    }
  }
}

window.GoBang = GoBang
