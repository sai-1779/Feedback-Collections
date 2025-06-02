const form = document.getElementById('feedbackForm');
  const feedbackList = document.getElementById('feedbackList');
  const responseMessage = document.getElementById('responseMessage');
  const clearAllBtn = document.getElementById('clearAllBtn');
  const filterCategory = document.getElementById('filterCategory');
  const sortBtn = document.getElementById('sortBtn');
  const exportBtn = document.getElementById('exportBtn');
  const ratingStars = document.getElementById('ratingStars');

  let feedbackData = JSON.parse(localStorage.getItem('feedbackList')) || [];
  let sortNewestFirst = true;
  let selectedRating = 5;

  // Initialize star rating
  ratingStars.innerHTML = [...Array(5)].map((_, i) => `<span data-value="${5 - i}">★</span>`).join('');
  ratingStars.addEventListener('click', e => {
   if (e.target.tagName === 'SPAN') {
    selectedRating = +e.target.dataset.value;
    updateStarRatingUI();
   }
  });

  function updateStarRatingUI() {
   const stars = ratingStars.querySelectorAll('span');
   stars.forEach(star => {
    star.classList.toggle('active', +star.dataset.value <= selectedRating);
   });
  }
  updateStarRatingUI();

  function renderFeedback() {
   feedbackList.innerHTML = '';
   let filtered = [...feedbackData];

   if (filterCategory.value !== 'All') {
    filtered = filtered.filter(f => f.category === filterCategory.value);
   }

   if (sortNewestFirst) filtered.reverse();

   if (filtered.length === 0) {
    feedbackList.innerHTML = '<p>No feedback found.</p>';
    clearAllBtn.style.display = 'none';
    return;
   }

   clearAllBtn.style.display = 'inline-block';

   filtered.forEach((entry, i) => {
    const div = document.createElement('div');
    div.className = 'feedback-item';
    div.innerHTML = `
     <strong>${entry.name}</strong> (${entry.email})
     <p>${entry.message}</p>
     <small>Category: ${entry.category} | Rating: ${entry.rating}★</small>
     <small>${new Date(entry.timestamp).toLocaleString()}</small>
     <button class="delete-btn" onclick="deleteFeedback(${i})">Delete</button>
    `;
    feedbackList.appendChild(div);
   });
  }

  function deleteFeedback(index) {
   feedbackData.splice(index, 1);
   localStorage.setItem('feedbackList', JSON.stringify(feedbackData));
   renderFeedback();
  }

  clearAllBtn.onclick = () => {
   if (confirm("Clear all feedback?")) {
    feedbackData = [];
    localStorage.removeItem('feedbackList');
    renderFeedback();
   }
  };

  sortBtn.onclick = () => {
   sortNewestFirst = !sortNewestFirst;
   sortBtn.textContent = `Sort: ${sortNewestFirst ? 'Newest' : 'Oldest'}`;
   renderFeedback();
  };

  filterCategory.onchange = renderFeedback;

  exportBtn.onclick = () => {
   const csv = "Name,Email,Message,Category,Rating,Timestamp\n" +
     feedbackData.map(f =>
       `"${f.name}","${f.email}","${f.message}","${f.category}",${f.rating},"${f.timestamp}"`
     ).join("\n");
   const blob = new Blob([csv], { type: "text/csv" });
   const a = document.createElement("a");
   a.href = URL.createObjectURL(blob);
   a.download = "feedback.csv";
   a.click();
  };

  form.onsubmit = e => {
   e.preventDefault();
   const name = document.getElementById('name').value.trim();
   const email = document.getElementById('email').value.trim();
   const message = document.getElementById('message').value.trim();
   const category = document.getElementById('category').value;

   if (name && email && message && category) {
    const feedback = {
     name, email, message, category,
     rating: selectedRating,
     timestamp: new Date().toISOString()
    };
    feedbackData.push(feedback);
    localStorage.setItem('feedbackList', JSON.stringify(feedbackData));
    responseMessage.textContent = "✅ Feedback submitted!";
    responseMessage.style.color = 'green';
    form.reset();
    selectedRating = 5;
    updateStarRatingUI();
    renderFeedback();
   } else {
    responseMessage.textContent = "❗ Please fill all fields.";
    responseMessage.style.color = 'red';
   }
  };

  function showTab(id) {
   document.querySelectorAll('.tab-section').forEach(sec => sec.classList.remove('active'));
   document.getElementById(id).classList.add('active');
  }

  window.onscroll = () => {
   document.getElementById('backToTop').style.display = window.scrollY > 200 ? 'block' : 'none';
  };

  function scrollToTop() {
   window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  renderFeedback();