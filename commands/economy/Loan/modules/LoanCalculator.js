const { MessageEmbed } = require('discord.js');

class LoanCalculator {
    calculate_total(items) {
        return items.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    apply_discount(total, discount_percentage) {
        return total * (1 - (discount_percentage / 100));
    }

    generate_invoice(customer, items, discount_percentage = 0) {
        const subtotal = this.calculate_total(items);
        const discounted_subtotal = this.apply_discount(subtotal, discount_percentage);
        const tax_rate = 0.08;
        const tax = discounted_subtotal * tax_rate;
        const total = discounted_subtotal + tax;

        return {
            customer,
            items,
            subtotal,
            discount_percentage,
            discounted_subtotal,
            tax,
            total
        };
    }

    create_invoice_embed(invoice) {
        const embeds = [];
        
        // Summary Embed
        const summaryEmbed = new MessageEmbed()
            .setTitle(`Invoice Summary for ${invoice.customer}`)
            .setColor('#0099ff')
            .setTimestamp()
            .addField('Status', '💰 Pending Payment', false)
            .addField('Total Items', `${invoice.items.length}`, true)
            .addField('Subtotal', `$${invoice.subtotal.toFixed(2)}`, true)
            .addField('\u200B', '\u200B', true);

        if (invoice.discount_percentage > 0) {
            summaryEmbed.addField('Discount Applied', `${invoice.discount_percentage}%`, true)
                       .addField('After Discount', `$${invoice.discounted_subtotal.toFixed(2)}`, true)
                       .addField('\u200B', '\u200B', true);
        }

        summaryEmbed.addField('Tax (8%)', `$${invoice.tax.toFixed(2)}`, true)
                   .addField('Final Total', `$${invoice.total.toFixed(2)}`, true)
                   .addField('\u200B', '\u200B', true);

        embeds.push(summaryEmbed);

        // Items Embed
        const itemsEmbed = new MessageEmbed()
            .setTitle(`Invoice Items - ${invoice.customer}`)
            .setColor('#00ff99')
            .setDescription('Detailed breakdown of items')
            .setTimestamp();

        // Group items in sets of 6 to avoid field limits
        for (let i = 0; i < invoice.items.length; i += 6) {
            const itemsChunk = invoice.items.slice(i, i + 6);
            
            itemsChunk.forEach(item => {
                itemsEmbed.addField(
                    item.name,
                    `💲${item.price.toFixed(2)} x ${item.quantity}\n= $${(item.price * item.quantity).toFixed(2)}`,
                    true
                );
            });

            if (itemsChunk.length % 3 !== 0) {
                itemsEmbed.addField('\u200B', '\u200B', true);
            }
        }

        embeds.push(itemsEmbed);

        // Payment Details Embed
        const paymentEmbed = new MessageEmbed()
            .setTitle('Payment Information')
            .setColor('#ff9900')
            .setTimestamp()
            .addField('Payment Methods', 'Cash 💵\nCredit Card 💳\nBank Transfer 🏦', true)
            .addField('Due Date', '30 days from issue', true)
            .addField('Invoice ID', `INV-${Date.now().toString(36).toUpperCase()}`, true)
            .setFooter({ text: 'Thank you for your business!' });

        embeds.push(paymentEmbed);

        return embeds;
    }
}

module.exports = { LoanCalculator };
