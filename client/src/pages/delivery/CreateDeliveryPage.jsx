import React, { useState } from 'react';

const CreateDeliveryPage = () => {
  const [addresses, setAddresses] = useState([
    { id: 1, label: 'Home', name: 'Clara Windermere', street: '42 Juniper Lane, Apt 3B', city: 'Oxford, OX1 2JD', country: 'United Kingdom', isActive: true },
    { id: 2, label: 'The Reading Nook', name: 'Clara Windermere', street: 'Old Oak Cottage, Rural Way', city: 'Cotswolds, GL54 3RS', country: 'United Kingdom', isActive: false }
  ]);
  const [deliveryMethod, setDeliveryMethod] = useState('eco');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [modalLabel, setModalLabel] = useState('');
  const [modalAddress, setModalAddress] = useState('');

  const openModal = (address = null) => {
    if (address) {
      setEditingAddress(address);
      setModalLabel(address.label);
      setModalAddress(`${address.name}\n${address.street}\n${address.city}\n${address.country}`);
    } else {
      setEditingAddress(null);
      setModalLabel('');
      setModalAddress('');
    }
    setIsModalOpen(true);
  };

  const saveAddress = () => {
    const addressLines = modalAddress.split('\n').filter(l => l.trim());
    if (editingAddress) {
      setAddresses(addresses.map(addr => 
        addr.id === editingAddress.id 
          ? { ...addr, label: modalLabel, name: addressLines[0] || '', street: addressLines[1] || '', city: addressLines[2] || '', country: addressLines[3] || '' }
          : addr
      ));
    } else {
      const newId = Math.max(...addresses.map(a => a.id), 0) + 1;
      setAddresses([...addresses, {
        id: newId,
        label: modalLabel || 'New Address',
        name: addressLines[0] || '',
        street: addressLines[1] || '',
        city: addressLines[2] || '',
        country: addressLines[3] || '',
        isActive: false
      }]);
    }
    setIsModalOpen(false);
  };

  const deleteAddress = (id) => {
    if (window.confirm('Delete this address?')) {
      setAddresses(addresses.filter(addr => addr.id !== id));
    }
  };

  const setActiveAddress = (id) => {
    setAddresses(addresses.map(addr => ({ ...addr, isActive: addr.id === id })));
  };

  const getDeliveryPrice = () => {
    switch(deliveryMethod) {
      case 'eco': return 25;
      case 'standard': return 45;
      case 'library': return 0;
      default: return 25;
    }
  };

  const totalPoints = 215 + getDeliveryPrice() - 5;

  return (
    <div className="bg-background font-body-md text-on-surface">
      {/* TopNavBar */}
      <header className="bg-surface border-b border-outline/20 sticky top-0 z-50">
        <nav className="flex justify-between items-center px-lg py-md w-full max-w-container-max mx-auto">
          <div className="flex items-center gap-xl">
            <a className="font-display-md text-display-md text-primary" href="#">ShareShelf</a>
            <div className="hidden md:flex gap-lg">
              <a className="text-text-grey hover:text-primary transition-colors font-body-md text-body-md" href="#">Marketplace</a>
              <a className="text-text-grey hover:text-primary transition-colors font-body-md text-body-md" href="#">Donations</a>
              <a className="text-text-grey hover:text-primary transition-colors font-body-md text-body-md" href="#">Crafts</a>
            </div>
          </div>
          <div className="flex items-center gap-md">
            <div className="hidden md:flex items-center bg-surface-container-low px-md py-xs rounded-full border border-outline/10">
              <span className="material-symbols-outlined text-outline">search</span>
              <input className="bg-transparent border-none focus:ring-0 text-sm w-48" placeholder="Search literary treasures..." type="text"/>
            </div>
            <div className="flex gap-sm">
              <button className="p-base text-primary hover:bg-surface-container-high rounded-full transition-all">
                <span className="material-symbols-outlined">shopping_cart</span>
              </button>
              <button className="p-base text-primary hover:bg-surface-container-high rounded-full transition-all">
                <span className="material-symbols-outlined">notifications</span>
              </button>
            </div>
            <div className="w-10 h-10 rounded-full overflow-hidden border border-primary/20">
              <img alt="User profile" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAVIkVF0VNf0Uak5Tbijz0EUb7NWrHFpk_kJee_csPPZBvem8BCp8zeu1EVnx-M4YfZrIjAESWtlmM3ezxZx5Rk9ObyzsqLNrwymFBzDxpaT7P9ZArs2jNAcjGSRfHCbr9h-jUSYuJn8-kgUpgz5fX0932ufrPTTBHQZ9l7KljP9VT_iK_bS-iLNvVeudefjbOuH6UWfbmbpTVMhVORJgDPw6UQJXElBNW96Jig3enCxDmjMFb7pSUtrVI5aszV274E3xS808Nez3pl"/>
            </div>
          </div>
        </nav>
      </header>

      <main className="max-w-container-max mx-auto px-lg py-xl">
        {/* Progress Stepper */}
        <div className="mb-xxl max-w-3xl mx-auto">
          <div className="flex items-center justify-between relative">
            <div className="absolute top-1/2 left-0 w-full h-[2px] bg-surface-variant -translate-y-1/2 z-0"></div>
            <div className="absolute top-1/2 left-0 w-2/4 h-[2px] bg-primary -translate-y-1/2 z-0"></div>
            <div className="relative z-10 flex flex-col items-center gap-sm">
              <div className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-md">
                <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
              </div>
              <span className="font-label-md text-label-md text-primary font-bold">Cart</span>
            </div>
            <div className="relative z-10 flex flex-col items-center gap-sm">
              <div className="w-12 h-12 rounded-full bg-primary text-on-primary flex items-center justify-center border-4 border-surface shadow-lg">
                <span className="material-symbols-outlined">local_shipping</span>
              </div>
              <span className="font-label-md text-label-md text-primary font-bold">Delivery</span>
            </div>
            <div className="relative z-10 flex flex-col items-center gap-sm">
              <div className="w-10 h-10 rounded-full bg-surface text-text-grey flex items-center justify-center border-2 border-surface-variant">
                <span className="material-symbols-outlined text-sm">payments</span>
              </div>
              <span className="font-label-md text-label-md text-text-grey">Payment</span>
            </div>
            <div className="relative z-10 flex flex-col items-center gap-sm">
              <div className="w-10 h-10 rounded-full bg-surface text-text-grey flex items-center justify-center border-2 border-surface-variant">
                <span className="material-symbols-outlined text-sm">fact_check</span>
              </div>
              <span className="font-label-md text-label-md text-text-grey">Review</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-xl">
          {/* Main Content */}
          <div className="flex-1 space-y-xl">
            {/* Delivery Address Section */}
            <section className="bg-surface rounded-xl p-xl shadow-sm border border-outline/10">
              <div className="flex justify-between items-center mb-lg">
                <h2 className="font-headline-md text-headline-md text-primary">Delivery Address</h2>
                <button onClick={() => openModal()} className="flex items-center gap-xs text-primary font-label-md hover:underline">
                  <span className="material-symbols-outlined text-sm">add_circle</span>
                  Add New Address
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                {addresses.map(addr => (
                  <div 
                    key={addr.id}
                    onClick={() => setActiveAddress(addr.id)}
                    className={`relative p-lg cursor-pointer rounded-xl transition-all ${
                      addr.isActive 
                        ? 'border-2 border-primary bg-primary/5' 
                        : 'border border-outline/20 hover:border-primary/50'
                    }`}
                  >
                    {addr.isActive && (
                      <div className="absolute top-4 right-4">
                        <span className="material-symbols-outlined text-primary fill-icon">check_circle</span>
                      </div>
                    )}
                    <p className="font-title-lg text-title-lg text-primary mb-xs">{addr.label}</p>
                    <p className="text-on-surface-variant leading-relaxed">
                      {addr.name}<br/>
                      {addr.street}<br/>
                      {addr.city}<br/>
                      {addr.country}
                    </p>
                    <div className="mt-md flex gap-md">
                      <button onClick={(e) => { e.stopPropagation(); openModal(addr); }} className="text-label-md text-primary font-bold">Edit</button>
                      <button onClick={(e) => { e.stopPropagation(); deleteAddress(addr.id); }} className="text-label-md text-text-grey">Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Delivery Method Section */}
            <section className="bg-surface rounded-xl p-xl shadow-sm border border-outline/10">
              <h2 className="font-headline-md text-headline-md text-primary mb-lg">Delivery Method</h2>
              <div className="space-y-md">
                <label className={`flex items-center gap-lg p-lg rounded-xl cursor-pointer transition-all ${
                  deliveryMethod === 'eco' ? 'border-2 border-primary bg-primary/5' : 'border border-outline/20 hover:border-primary/50'
                }`}>
                  <input checked={deliveryMethod === 'eco'} onChange={() => setDeliveryMethod('eco')} className="w-5 h-5 text-primary border-outline focus:ring-primary" name="delivery_method" type="radio"/>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <span className={`font-title-lg text-title-lg flex items-center gap-xs ${deliveryMethod === 'eco' ? 'text-primary' : ''}`}>
                        Eco-Friendly Courier
                        <span className="bg-success/10 text-success text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full font-bold border border-success/20">Recommended</span>
                      </span>
                      <span className={`font-title-lg text-title-lg ${deliveryMethod === 'eco' ? 'text-primary' : ''}`}>25 Points</span>
                    </div>
                    <p className="text-on-surface-variant text-body-md mt-xs">Low carbon footprint delivery via electric vehicle or bicycle. (3-5 business days)</p>
                  </div>
                </label>
                <label className={`flex items-center gap-lg p-lg rounded-xl cursor-pointer transition-all ${
                  deliveryMethod === 'standard' ? 'border-2 border-primary bg-primary/5' : 'border border-outline/20 hover:border-primary/50'
                }`}>
                  <input checked={deliveryMethod === 'standard'} onChange={() => setDeliveryMethod('standard')} className="w-5 h-5 text-primary border-outline focus:ring-primary" name="delivery_method" type="radio"/>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <span className={`font-title-lg text-title-lg ${deliveryMethod === 'standard' ? 'text-primary' : ''}`}>Standard Shipping</span>
                      <span className={`font-title-lg text-title-lg ${deliveryMethod === 'standard' ? 'text-primary' : ''}`}>45 Points</span>
                    </div>
                    <p className="text-on-surface-variant text-body-md mt-xs">Reliable nationwide tracking. (2-3 business days)</p>
                  </div>
                </label>
                <label className={`flex items-center gap-lg p-lg rounded-xl cursor-pointer transition-all ${
                  deliveryMethod === 'library' ? 'border-2 border-primary bg-primary/5' : 'border border-outline/20 hover:border-primary/50'
                }`}>
                  <input checked={deliveryMethod === 'library'} onChange={() => setDeliveryMethod('library')} className="w-5 h-5 text-primary border-outline focus:ring-primary" name="delivery_method" type="radio"/>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <span className={`font-title-lg text-title-lg ${deliveryMethod === 'library' ? 'text-primary' : ''}`}>Local Library Drop-off</span>
                      <span className={`font-title-lg text-title-lg text-success ${deliveryMethod === 'library' ? 'text-primary' : ''}`}>Free</span>
                    </div>
                    <p className="text-on-surface-variant text-body-md mt-xs">Pick up from your community partner library. (Available in 48 hours)</p>
                  </div>
                </label>
              </div>
            </section>

            {/* Sustainability Impact */}
            <section className="bg-secondary-container/30 border border-secondary-container rounded-xl p-lg flex items-center gap-lg overflow-hidden relative">
              <div className="absolute -right-4 -bottom-4 opacity-10">
                <span className="material-symbols-outlined text-8xl text-primary" style={{ fontVariationSettings: "'wght' 200" }}>eco</span>
              </div>
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-on-primary text-3xl">nature_people</span>
              </div>
              <div>
                <h3 className="font-title-lg text-title-lg text-primary">Sustainability Impact</h3>
                <p className="text-on-surface-variant mt-1 max-w-md">By choosing Eco-Friendly delivery, you are saving approximately <span className="font-bold text-primary">1.2kg of CO2 emissions</span>—the equivalent of planting 2 young saplings today.</p>
              </div>
            </section>
          </div>

          {/* Order Summary Sidebar */}
          <aside className="w-full lg:w-[380px] shrink-0">
            <div className="bg-surface rounded-xl p-xl shadow-md border border-outline/10 sticky top-24">
              <h2 className="font-headline-md text-headline-md text-primary mb-lg">Order Summary</h2>
              <div className="space-y-md mb-xl pb-xl border-b border-outline/10">
                <div className="flex gap-md">
                  <div className="w-20 h-28 bg-surface-container rounded-lg overflow-hidden shadow-sm">
                    <img alt="Book Cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC7_fCwpwXkegk88AhSPtAblrHboz6PUNiaouSCwvSRnel3bSWlHLXC6dN0wEPzfuVaXl89OFWjLLqCtSMsVqFpxbIvIoDcNc0adDrOXcgO66jIHHeDsg2x9lZ-JrTKS_-ygJo4ObC1iqXi3T9hByLQAo3KlLwwh3-9tsX4SBK0r5ZopOzstJ6SgCFyC2FWt-m-fgKxsmGXfFtL-KqJKEKp9MbgR9I-I-VpV03IvQ6tAlb9aAkAI3FCMf9NAuDcNxQsGoyi0hpXF9kz"/>
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-primary text-label-md">The Great Gatsby</p>
                    <p className="text-label-sm text-text-grey">F. Scott Fitzgerald</p>
                    <p className="font-bold text-accent mt-2">120 Points</p>
                  </div>
                </div>
                <div className="flex gap-md">
                  <div className="w-20 h-28 bg-surface-container rounded-lg overflow-hidden shadow-sm">
                    <img alt="Book Cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDm_FvGStvM68GgpHDEbW8gOk25SZW3A7ULtBmrwu1Mf63zbcTphiM5V8lgzBnpIOL1bz6f25Es3Or5HtaRhZJSoA2xKuA3fayovKDQrf3iHfgYXe8yjUx8VAmY_mJewA_cNWGfprJrEBepUGMihgvVW_12RvZ1-r6XUMUa7kDoWHS1s_KjtHiG02UDvQL7nKYJVSOvXSSlz7MOdeSK0PKLoUFSOwuayNXWQBZAHDI4DxGAq8LtM6Ri2xou0irWbpkMhDKUdz75BBB2"/>
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-primary text-label-md">Silent Spring</p>
                    <p className="text-label-sm text-text-grey">Rachel Carson</p>
                    <p className="font-bold text-accent mt-2">95 Points</p>
                  </div>
                </div>
              </div>
              <div className="space-y-sm mb-xl">
                <div className="flex justify-between text-on-surface-variant">
                  <span>Subtotal</span>
                  <span>215 Points</span>
                </div>
                <div className="flex justify-between text-on-surface-variant">
                  <span>Eco-Shipping</span>
                  <span>{getDeliveryPrice()} Points</span>
                </div>
                <div className="flex justify-between text-on-surface-variant">
                  <span>Sustainable Credit</span>
                  <span className="text-success">-5 Points</span>
                </div>
                <div className="flex justify-between font-headline-md text-headline-md text-primary mt-md pt-md border-t border-outline/10">
                  <span>Total</span>
                  <span>{totalPoints} Points</span>
                </div>
              </div>
              <div className="bg-surface-container-low p-md rounded-lg mb-xl">
                <div className="flex items-center gap-sm text-primary mb-1">
                  <span className="material-symbols-outlined text-sm">calendar_month</span>
                  <span className="font-label-md font-bold">Estimated Delivery</span>
                </div>
                <p className="text-on-surface-variant text-label-md">Friday, Oct 24th - Monday, Oct 27th</p>
              </div>
              <button className="w-full bg-primary text-on-primary py-lg rounded-full font-bold text-title-lg shadow-lg hover:bg-primary/90 transition-all active:scale-[0.98]">
                Continue to Payment
              </button>
              <p className="text-center text-label-sm text-text-grey mt-md">Secure checkout powered by BookShield</p>
            </div>
          </aside>
        </div>
      </main>

      {/* Address Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setIsModalOpen(false)}>
          <div className="bg-surface rounded-lg p-xl w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-title-lg text-title-lg mb-md">{editingAddress ? 'Edit Address' : 'Add New Address'}</h3>
            <div className="space-y-md">
              <input 
                className="w-full p-2 border rounded" 
                placeholder="Label (Home, Work)" 
                value={modalLabel}
                onChange={(e) => setModalLabel(e.target.value)}
              />
              <textarea 
                className="w-full p-2 border rounded" 
                rows="6" 
                placeholder="Full address (one line per field: Name&#10;Street&#10;City, ZIP&#10;Country)"
                value={modalAddress}
                onChange={(e) => setModalAddress(e.target.value)}
              />
              <div className="flex justify-end gap-md">
                <button onClick={() => setIsModalOpen(false)} className="text-text-grey px-md py-sm rounded">Cancel</button>
                <button onClick={saveAddress} className="bg-primary text-on-primary px-md py-sm rounded">Save</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-surface-container-low border-t border-outline/20 mt-xxl">
        <div className="w-full py-xl px-lg flex flex-col md:flex-row justify-between items-center gap-md max-w-container-max mx-auto">
          <div className="flex flex-col gap-sm items-center md:items-start">
            <span className="font-headline-md text-headline-md text-primary">ShareShelf</span>
            <p className="font-body-md text-body-md text-text-grey text-center md:text-left max-w-xs">© 2024 ShareShelf. Cultivating community through literature.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-xl">
            <a className="text-text-grey hover:text-accent transition-colors font-label-sm text-label-sm uppercase tracking-widest" href="#">About Us</a>
            <a className="text-text-grey hover:text-accent transition-colors font-label-sm text-label-sm uppercase tracking-widest" href="#">Sustainability</a>
            <a className="text-text-grey hover:text-accent transition-colors font-label-sm text-label-sm uppercase tracking-widest" href="#">Privacy Policy</a>
            <a className="text-text-grey hover:text-accent transition-colors font-label-sm text-label-sm uppercase tracking-widest" href="#">Terms of Service</a>
          </div>
          <div className="flex gap-md">
            <button className="p-base text-primary hover:text-accent transition-colors">
              <span className="material-symbols-outlined">share</span>
            </button>
            <button className="p-base text-primary hover:text-accent transition-colors">
              <span className="material-symbols-outlined">public</span>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default CreateDeliveryPage;