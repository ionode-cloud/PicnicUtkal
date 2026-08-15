const express = require('express')
const router = express.Router()
const SiteConfig = require('../models/SiteConfig')

// GET /api/site-config -> fetch all site configs
router.get('/', async (req, res) => {
  try {
    const configs = await SiteConfig.find({})
    const result = {}
    configs.forEach(c => {
      result[c.key] = c.data
    })
    res.json({ success: true, data: result })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// GET /api/site-config/:key -> fetch specific key
router.get('/:key', async (req, res) => {
  try {
    const configDoc = await SiteConfig.findOne({ key: req.params.key })
    let val = configDoc ? (configDoc.data !== undefined ? configDoc.data : configDoc.value) : null

    // If key is 'addons_config' and not yet in DB, return default active addons
    if ((!val || (Array.isArray(val) && val.length === 0)) && req.params.key === 'addons_config') {
      const defaultAddons = [
        {
          id: 'ad_gas_chulha',
          name: '🔥 Gas & Chulha Booking',
          desc: 'Full outdoor kitchen burner stove and filled LPG cylinder setup.',
          priceAddon: 250,
          status: 'Active',
          items: [
            '1x Commercial Single-Burner Chulha (Stove)',
            '1x 5kg LPG Gas Cylinder (Pre-filled, ready to use)',
            'High-pressure gas regulator and safety hose pipe',
            'Gas lighter utility included'
          ]
        },
        {
          id: 'ad_cooking_kit',
          name: '🍳 Cooking Accessories Pack',
          desc: 'Complete picnic cookware, serving spoons and preparation kit.',
          priceAddon: 150,
          status: 'Active',
          items: [
            '2x Large Aluminum Cooking Pots (Dekchi with lids)',
            '1x Deep Frying Pan (Kadai) & 1x Tawa',
            'Large cooking ladles, spatula & serving spoons',
            'Heavy-duty chopping board & 2x stainless steel kitchen knives',
            'Dishwashing gel, scrubber sponge & cleaning cloth'
          ]
        },
        {
          id: 'ad_sound',
          name: '🔊 Standard Sound System',
          desc: 'Dual speakers, microphone, Bluetooth audio receiver',
          priceAddon: 150,
          status: 'Active',
          items: [
            '2x Active Sound Tower Speakers (JBL 15-inch)',
            '1x Audio Mixing Console (Yamaha 6-channel)',
            '1x Wireless Handheld Vocal Microphone',
            'Bluetooth receiver, AUX cable, and power extension leads'
          ]
        },
        {
          id: 'ad_catering',
          name: '🍽 Catering Table Setup',
          desc: 'Elegant buffet tables with satin cloth skirting',
          priceAddon: 100,
          status: 'Active',
          items: [
            '4x Buffet / food serving tables (6x3 ft metal frame)',
            'Premium white satin fabric table spreads',
            'Pleated gold border table skirtings'
          ]
        },
        {
          id: 'ad_decor',
          name: '🌸 Floral Welcome Arch',
          desc: 'Decorated entry arch with fresh seasonal flowers',
          priceAddon: 250,
          status: 'Active',
          items: [
            'Yellow/orange fresh marigolds & white lily floral decorations',
            'Sturdy welcome gate frame structure',
            'Welcome text writing board'
          ]
        },
        {
          id: 'ad_power',
          name: '⚡ Dedicated Silent Generator',
          desc: 'Uninterrupted power supply backup for event hours',
          priceAddon: 200,
          status: 'Active',
          items: [
            '1x 5 KVA Silent Diesel Generator Set',
            'Fuel included for up to 8 hours of peak load operation',
            'Safety MCB distribution box and extension cables'
          ]
        }
      ]
      SiteConfig.findOneAndUpdate(
        { key: 'addons_config' },
        { key: 'addons_config', data: defaultAddons },
        { upsert: true, new: true }
      ).catch(() => {})
      return res.status(200).json({ success: true, data: defaultAddons, value: defaultAddons })
    }

    // If key is 'upi_qr_config' and not yet in DB, return default active UPI configuration
    if (!val && req.params.key === 'upi_qr_config') {
      const defaultUpiConfig = {
        enabled: true,
        upiId: 'picnicutkal@upi',
        payeeName: 'PicnicUtkal Resort',
        merchantCode: '',
        note: 'Picnic Spot Reservation',
        useCustomQrImage: false,
        customQrImage: '',
        instructions: 'Open PhonePe, Google Pay, Paytm, or BHIM app and scan the QR code to finish your reservation.',
        paymentConfirmationNote: 'After completing UPI transfer, click Confirm & Pay to get your instant QR reservation ticket.',
        showBankDetails: true,
        accountHolder: 'PicnicUtkal Tourism Pvt Ltd',
        bankName: 'HDFC Bank',
        accountNumber: '50200088991122',
        ifscCode: 'HDFC0001234'
      }
      SiteConfig.findOneAndUpdate(
        { key: 'upi_qr_config' },
        { key: 'upi_qr_config', data: defaultUpiConfig },
        { upsert: true, new: true }
      ).catch(() => {})
      return res.status(200).json({ success: true, data: defaultUpiConfig, value: defaultUpiConfig })
    }

    res.status(200).json({ success: true, data: val, value: val })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

const saveConfigHandler = async (req, res) => {
  try {
    const { key } = req.params
    const rawData = req.body.data !== undefined ? req.body.data : (req.body.value !== undefined ? req.body.value : req.body)

    let configDoc = await SiteConfig.findOne({ key })
    if (configDoc) {
      configDoc.data = rawData
      configDoc.markModified('data')
      await configDoc.save()
    } else {
      configDoc = await SiteConfig.create({ key, data: rawData })
    }

    // Socket.io real-time broadcast
    if (req.io) {
      if (key === 'user_view_config') {
        req.io.emit('home_config_update', { config: rawData?.home || {} })
        req.io.emit('about_config_update', { config: rawData?.about || {} })
        req.io.emit('gallery_config_update', { config: rawData?.gallery || [] })
        req.io.emit('contact_config_update', { config: rawData?.contact || {} })
        req.io.emit('footer_config_update', { config: rawData?.footer || {} })
      } else if (key === 'admin_zones' || key === 'zones') {
        req.io.emit('zones_config_update', { zones: Array.isArray(rawData) ? rawData : (rawData?.zones || []) })
      } else if (key === 'admin_maps' || key === 'maps') {
        req.io.emit('map_config_update', { maps: Array.isArray(rawData) ? rawData : [] })
      } else if (key === 'map_plots_config' || key === 'plots') {
        req.io.emit('plots_update', { plots: Array.isArray(rawData) ? rawData : [] })
      } else if (key === 'logo_config' || key === 'logo') {
        req.io.emit('logo_config_update', { logo: rawData })
      } else if (key === 'addons_config' || key === 'addons') {
        req.io.emit('addons_config_update', { addons: Array.isArray(rawData) ? rawData : [] })
      } else if (key === 'upi_qr_config' || key === 'upi') {
        req.io.emit('upi_qr_config_update', { upiConfig: rawData })
      }
    }

    res.status(200).json({ success: true, data: configDoc.data, value: configDoc.data, message: 'Saved persistently to MongoDB' })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

router.put('/:key', saveConfigHandler)
router.post('/:key', saveConfigHandler)

module.exports = router
