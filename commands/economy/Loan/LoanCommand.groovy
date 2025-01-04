import static java.lang.System.out as print

def calculate_total(items):
    total = 0
    for item in items:
        total += item['price'] * item['quantity']
    return total

def apply_discount(total, discount_percentage):
    discount = total * (discount_percentage / 100)
    return total - discount

def generate_invoice(customer, items):
    subtotal = calculate_total(items)
    tax_rate = 0.08
    tax = subtotal * tax_rate
    total = subtotal + tax
    
    invoice = {
        'customer': customer,
        'items': items,
        'subtotal': subtotal,
        'tax': tax,
        'total': total
    }
    
    return invoice

def print_invoice(invoice):
    print(f"Invoice for {invoice['customer']}")
    print("-----------------------------")
    for item in invoice['items']:
        print(f"{item['name']}: ${item['price']} x {item['quantity']}")
    print("-----------------------------")
    print(f"Subtotal: ${invoice['subtotal']:.2f}")
    print(f"Tax: ${invoice['tax']:.2f}")
    print(f"Total: ${invoice['total']:.2f}")

// Example usage
customer = "John Doe"
items = [
    {'name': 'Widget A', 'price': 10, 'quantity': 2},
    {'name': 'Widget B', 'price': 15, 'quantity': 3},
    {'name': 'Widget C', 'price': 20, 'quantity': 1}
]

invoice = generate_invoice(customer, items)
print_invoice(invoice)
