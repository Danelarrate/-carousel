class Carousel {
  constructor(container, options = {}) {
    this.container = document.querySelector(container)
    this.options = {
      velocityScale: 0.05,
      friction: 0.99,
      carouselZPos: 754,
      inclination: 0,
      itemCount: 8,
      itemWidth: 300,
      gap: 1.7,
      ...options
    }

    this.currentRotation = 0
    this.velocity = 0
    this.isDragging = false
    this.animationFrameId = null

    this.items = [] // Para almacenar los elementos generados
    this.handleMouseDown = this.handleMouseDown.bind(this)
    this.handleMouseMove = this.handleMouseMove.bind(this)
    this.handleMouseUp = this.handleMouseUp.bind(this)

    this.handleMouseEnter = this.handleMouseEnter.bind(this)
    this.handleMouseLeave = this.handleMouseLeave.bind(this)

    this.init()
  }

  init() {
    this.generateItems()
    this.addEventListeners()
    this.updateVisibility()
  }
  updateVisibility() {
    this.items.forEach((item) => {
      const itemRelativeRotation =
        Math.abs(
          this.currentRotation + parseFloat(item.getAttribute('data-rotation'))
        ) % 360 // Normalizamos la rotación a [0, 360)

      // Verificar si el ítem está en el rango visible de la mitad posterior
      if (itemRelativeRotation < 90 || itemRelativeRotation > 270) {
        // El rango visible no cruza el 0°
        item.style.visibility = 'hidden'
        item.style.pointerEvents = 'none'
      } else {
        // El rango visible cruza el 0°
        item.style.visibility = ''
        item.style.pointerEvents = 'auto'
      }
    })
  }

  generateItems() {
    const { itemCount, itemWidth, gap } = this.options
    const angleStep = 360 / itemCount

    for (let i = 0; i < itemCount; i++) {
      const item = document.createElement('div')
      item.className = 'carousel-item'
      item.setAttribute('data-rotation', angleStep * i)

      const angle = angleStep * i
      const rotation = `rotateY(${angle}deg) translateZ(${
        this.calcularRadio(itemCount, itemWidth) - itemWidth * gap
      }px)`

      item.style.transform = rotation
      item.style.width = `${itemWidth}px`

      const imgWrap = document.createElement('div')
      const img = document.createElement('img')
      img.src = `https://picsum.photos/id/${i + 38}/1920`
      img.alt = 'photo ${i + 38}'
      imgWrap.appendChild(img)
      item.appendChild(imgWrap)
      // // Texto que aparece en hover
      // const text = document.createElement('div')
      // text.className = 'carousel-text hide'
      // text.textContent = `Item ${angle}`
      // item.appendChild(text)

      // // Asignar los event listeners para cada item
      // item.addEventListener('mouseenter', this.handleMouseEnter)
      // item.addEventListener('mouseleave', this.handleMouseLeave)

      this.items.push(item) // Guardar referencia al item

      this.container.appendChild(item)
    }
  }

  calcularRadio(numItems, itemWidth) {
    const spacing = itemWidth * 2
    return (spacing * numItems) / (2 * Math.PI)
  }

  addEventListeners() {
    window.addEventListener('mousedown', this.handleMouseDown)
    window.addEventListener('mousemove', this.handleMouseMove)
    window.addEventListener('mouseup', this.handleMouseUp)
  }

  // Funciones de interacción con el mouse
  handleMouseDown(e) {
    this.isDragging = true
    this.startX = e.clientX
    //hideTexts()
    cancelAnimationFrame(this.animationFrameId)
  }

  handleMouseMove(e) {
    if (!this.isDragging) return
    const deltaX = e.clientX - this.startX
    this.velocity = deltaX * this.options.velocityScale
    this.startX = e.clientX

    this.currentRotation += this.velocity
    this.container.style.transform = `translateZ(${this.options.carouselZPos}px) rotateZ(-${this.options.inclination}) rotateY(${this.currentRotation}deg)`
    this.container.setAttribute('data-current-rotation', this.currentRotation)
    this.updateVisibility()
  }

  handleMouseUp() {
    this.isDragging = false
    this.applyElasticEffect()
  }

  applyElasticEffect() {
    if (Math.abs(this.velocity) > 0.1) {
      this.velocity *= this.options.friction
      this.currentRotation += this.velocity
      this.container.style.transform = `translateZ(${this.options.carouselZPos}px) rotateZ(-${this.options.inclination}) rotateY(${this.currentRotation}deg)`
      this.container.setAttribute('data-current-rotation', this.currentRotation)
      this.animationFrameId = requestAnimationFrame(
        this.applyElasticEffect.bind(this)
      )
      //hideTexts()
    } else {
      //showTexts()
    }
    this.updateVisibility()
  }

  // Eventos de hover para los elementos
  handleMouseEnter(event) {
    const item = event.currentTarget
    const text = item.querySelector('.carousel-text')
    let currentRotation = parseFloat(
      this.container.getAttribute('data-current-rotation') || '0'
    )
    let itemRotation = parseFloat(item.getAttribute('data-rotation'))
    const textRotation = -currentRotation - itemRotation
    text.style.transform = `rotateY(${textRotation}deg) rotateZ(${this.options.inclination}) translateZ(50px)`
    text.classList.add('active')
    text.classList.remove('hide')
  }

  handleMouseLeave(event) {
    const item = event.currentTarget
    const text = item.querySelector('.carousel-text')
    text.classList.remove('active')
    text.classList.add('hide')
  }

  // Nueva lógica para ocultar y mostrar los textos de los items

  // Método para destruir la instancia y limpiar los eventos
  destroy() {
    // Eliminar los listeners globales
    window.removeEventListener('mousedown', this.handleMouseDown)
    window.removeEventListener('mousemove', this.handleMouseMove)
    window.removeEventListener('mouseup', this.handleMouseUp)

    // Eliminar los listeners de cada item
    this.items.forEach((item) => {
      item.removeEventListener('mouseenter', this.handleMouseEnter)
      item.removeEventListener('mouseleave', this.handleMouseLeave)
    })

    cancelAnimationFrame(this.animationFrameId)
    this.container.innerHTML = '' // Limpiar el DOM generado
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const container = document.querySelector('.carousel-content')
  container.style.transform = `translateZ(754px) rotateY(0) rotateZ(-0)`
  const carousel = new Carousel('.carousel-content', {
    itemCount: 12,
    itemWidth: 536
  })

  window.addEventListener('beforeunload', () => {
    carousel.destroy()
  })
})

const hideTexts = () => {
  document.querySelectorAll('.carousel-text').forEach((el) => {
    el.style.display = 'none'
  })
}

const showTexts = () => {
  document.querySelectorAll('.carousel-text').forEach((el) => {
    el.style.display = ''
  })
}
