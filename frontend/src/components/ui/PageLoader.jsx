import { motion } from 'framer-motion'
import { LuLeaf as Leaf } from 'react-icons/lu'

export default function PageLoader() {
  return (
    <motion.div
      className="page-loader"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div style={{ textAlign: 'center' }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          style={{ display: 'inline-block', marginBottom: '1rem', color: 'var(--light-green)' }}
        >
          <Leaf size={40} />
        </motion.div>
        <div className="loader-logo">
          Picnic<span className="text-gradient">Utkal</span>
        </div>
      </div>
      <div className="loader-bar" />
    </motion.div>
  )
}