import api from './api';

class MatchingService {
  async getDonationMatches(donationId) {
    const response = await api.get(`/donations/${donationId}/matches`);
    return response.data;
  }
}

const matchingService = new MatchingService();
export default matchingService;
