import { Object3D } from 'three'
import { defineComponent, inject, PropType } from 'vue'
import usePointer, { IntersectObject, PointerInterface, PointerIntersectCallbackType } from './usePointer'
import { RendererInjectionKey, RendererInterface } from './Renderer'

// eslint-disable-next-line @typescript-eslint/no-empty-function
const emptyCallBack: PointerIntersectCallbackType = () => {}

interface RaycasterSetupInterface {
  renderer?: RendererInterface
  pointer?: PointerInterface
}

export default defineComponent({
  name: 'Raycaster',
  props: {
    onPointerEnter: { type: Function as PropType<PointerIntersectCallbackType>, default: emptyCallBack },
    onPointerOver: { type: Function as PropType<PointerIntersectCallbackType>, default: emptyCallBack },
    onPointerMove: { type: Function as PropType<PointerIntersectCallbackType>, default: emptyCallBack },
    onPointerLeave: { type: Function as PropType<PointerIntersectCallbackType>, default: emptyCallBack },
    onClick: { type: Function as PropType<PointerIntersectCallbackType>, default: emptyCallBack },
    intersectMode: { type: String, default: 'move' },
  },
  setup(): RaycasterSetupInterface {
    const renderer = inject(RendererInjectionKey)
    return { renderer }
  },
  mounted() {
    if (!this.renderer) {
      console.error('Renderer not found')
      return
    }
    const renderer = this.renderer

    this.renderer.onMounted(() => {
      if (!renderer.camera) return

      this.pointer = usePointer({
        camera: renderer.camera,
        domElement: renderer.canvas,
        intersectObjects: this.getIntersectObjects(),
        onIntersectEnter: this.onPointerEnter,
        onIntersectOver: this.onPointerOver,
        onIntersectMove: this.onPointerMove,
        onIntersectLeave: this.onPointerLeave,
        onIntersectClick: this.onClick,
      })
      this.pointer.addListeners()

      if (this.intersectMode === 'frame') {
        renderer.onBeforeRender(this.pointer.intersect)
      }
    })
  },
  unmounted() {
    if (this.pointer) {
      this.pointer.removeListeners()
      this.renderer?.offBeforeRender(this.pointer.intersect)
    }
  },
  methods: {
    getIntersectObjects() {
      if (this.renderer && this.renderer.scene) {
        const children = this.renderer.scene.children.filter((c: Object3D) => ['Mesh', 'InstancedMesh'].includes(c.type))
        return children as IntersectObject[]
      }
      return []
    },
  },
  render() {
    return []
  },
  __hmrId: 'Raycaster',
})