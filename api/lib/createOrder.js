function generateOrderRef() {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  const suffix = String(Math.floor(Math.random() * 900) + 100)
  return `ORD-${date}-${suffix}`
}

export function parseCityFromAddress(address) {
  const parts = address
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)
  if (parts.length >= 2) return parts[1]
  return 'Mauritius'
}

function buildLineItems(items, { deliveryFee = 0, discountAmount = 0 } = {}) {
  const lines = items.map((item, index) => {
    const colorSuffix = item.color ? ` (${item.color})` : ''
    const productName = `${item.name}${colorSuffix}`
    const unitPrice = Number(item.price)
    const quantity = Number(item.quantity)

    return {
      item_id: item.productId,
      product_name: productName,
      quantity,
      unit_price: unitPrice,
      line_total: unitPrice * quantity,
      sort_order: index,
    }
  })

  if (deliveryFee > 0) {
    lines.push({
      product_name: 'Delivery fee',
      quantity: 1,
      unit_price: Number(deliveryFee),
      line_total: Number(deliveryFee),
      sort_order: lines.length,
    })
  }

  if (discountAmount > 0) {
    lines.push({
      product_name: 'Gift card discount',
      quantity: 1,
      unit_price: -Number(discountAmount),
      line_total: -Number(discountAmount),
      sort_order: lines.length,
    })
  }

  return lines
}

async function supabaseRequest(supabaseUrl, serviceKey, path, options = {}) {
  const response = await fetch(`${supabaseUrl}/rest/v1/${path}`, {
    ...options,
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(text || `Supabase error ${response.status}`)
  }

  if (response.status === 204) {
    return null
  }

  return response.json()
}

/**
 * Insert parent order + line items (service role).
 */
export async function createOrderInDb(
  { customer, items, total, deliveryFee, discountAmount },
  { supabaseUrl, serviceKey },
) {
  if (!customer?.fullName?.trim()) {
    throw new Error('Customer name is required')
  }
  if (!customer?.phone?.trim()) {
    throw new Error('Phone number is required')
  }
  if (!customer?.address?.trim()) {
    throw new Error('Address is required')
  }
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error('At least one order item is required')
  }

  const city = parseCityFromAddress(customer.address)
  const address = customer.notes?.trim()
    ? `${customer.address.trim()}\nNotes: ${customer.notes.trim()}`
    : customer.address.trim()

  const lineItems = buildLineItems(items, { deliveryFee, discountAmount })

  let order = null
  let lastError = null

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const orderRef = generateOrderRef()

    try {
      const [inserted] = await supabaseRequest(
        supabaseUrl,
        serviceKey,
        'whatsapp_bot_orders',
        {
          method: 'POST',
          headers: { Prefer: 'return=representation' },
          body: JSON.stringify({
            order_ref: orderRef,
            company: 'sodamax',
            customer_name: customer.fullName.trim(),
            customer_phone_number: customer.phone.trim(),
            city,
            address,
            total: Number(total),
            status: 'pending',
          }),
        },
      )

      order = inserted
      break
    } catch (err) {
      lastError = err
      if (!String(err.message).includes('whatsapp_bot_orders_order_ref_key')) {
        throw err
      }
    }
  }

  if (!order) {
    throw lastError || new Error('Failed to create order')
  }

  const orderItemsPayload = lineItems.map((line) => {
    const row = {
      order_id: order.id,
      product_name: line.product_name,
      quantity: line.quantity,
      unit_price: line.unit_price,
      line_total: line.line_total,
      sort_order: line.sort_order,
    }
    if (line.item_id) {
      row.item_id = line.item_id
    }
    return row
  })

  try {
    await supabaseRequest(supabaseUrl, serviceKey, 'whatsapp_bot_orders_items', {
      method: 'POST',
      headers: { Prefer: 'return=minimal' },
      body: JSON.stringify(orderItemsPayload),
    })
  } catch (err) {
    await supabaseRequest(
      supabaseUrl,
      serviceKey,
      `whatsapp_bot_orders?id=eq.${order.id}`,
      { method: 'DELETE', headers: { Prefer: 'return=minimal' } },
    ).catch(() => {})
    throw err
  }

  return {
    id: order.id,
    order_ref: order.order_ref,
  }
}
